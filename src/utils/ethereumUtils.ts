import Web3 from "web3";
import { Trie } from "@ethereumjs/trie";

import { RLP } from "@ethereumjs/rlp";
import { FeeMarketEIP1559Transaction, AccessListEIP2930Transaction, LegacyTransaction } from '@ethereumjs/tx';
import { Common } from '@ethereumjs/common';

const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;

const LOGGING_ENABLED = false;

const chainIdToRPC: Record<number, string> = {
    1: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    11155111: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    59144: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    59141: `https://linea-sepolia.infura.io/v3/${INFURA_API_KEY}`,
}

/**
 * Encodes a transaction receipt according to Ethereum rules
 * @param {Object} receipt - The transaction receipt object
 * @returns {Buffer} - The RLP encoded receipt
 */
function encodeReceipt(receipt: any) {
    // Determine receipt type
    const type = typeof receipt.type === 'string' ? 
        parseInt(receipt.type.slice(2), 16) : 
        (receipt.type === undefined ? 0 : Number(receipt.type));
    
    // Convert status to the correct format
    // Status can be boolean, hex string, or number
    let status;
    if (receipt.status !== undefined) {
        if (typeof receipt.status === 'boolean') {
            status = receipt.status ? 1 : 0;
        } else if (typeof receipt.status === 'string') {
            status = receipt.status === '0x1' ? 1 : 0;
        } else {
            status = Number(receipt.status) ? 1 : 0;
        }
    } else if (receipt.root) {
        // Pre-Byzantium receipts used a state root instead of status
        status = receipt.root;
    } else {
        status = 0;
    }
    
    // Format logs - each log is [address, topics, data]
    const logs = receipt.logs.map((log: any) => [
        log.address,
        log.topics,
        log.data
    ]);
    
    // Prepare the receipt data array
    const receiptData = [
        status,
        receipt.cumulativeGasUsed,
        receipt.logsBloom,
        logs
    ];
    
    // Encode based on type
    if (type === 0) {
        // Legacy receipt - just RLP encode the data
        return RLP.encode(receiptData);
    } else if (type === 1) {
        // EIP-2930 receipt - prefix with 0x01
        const encodedReceipt = RLP.encode(receiptData);
        return Buffer.concat([Buffer.from([1]), encodedReceipt]);
    } else if (type === 2) {
        // EIP-1559 receipt - prefix with 0x02
        const encodedReceipt = RLP.encode(receiptData);
        return Buffer.concat([Buffer.from([2]), encodedReceipt]);
    } else {
        throw new Error(`Unknown receipt type: ${type}`);
    }
}

async function getTransactionProof(txHash: `0x${string}`, chainId: number) {
    // 1. Get Transaction Receipt
    const web3 = new Web3(chainIdToRPC[chainId]);
    const txRaw = await web3.eth.getTransaction(txHash);

    if (!txRaw) {
        console.error("Transaction not found");
        return;
    } else {
        if (LOGGING_ENABLED) {
            console.log("Transaction found");
        }
    }

    // 2. Get Block containing the transaction
    const block = await web3.eth.getBlock(txRaw.blockHash, true);
    if (!block) {
        console.error("Block not found");
        return;
    }
    
    if (LOGGING_ENABLED) {
        console.log(`Found transaction at index ${txRaw.transactionIndex} in block ${block.number}`);
        console.log("Block transactions root:", block.transactionsRoot);
    }

    // 3. Initialize a Merkle Patricia Trie
    const trie = new Trie();
    
    // Create a Common object for the chain
    const cId = await web3.eth.getChainId();
    const common = Common.custom({ chainId: cId });

    // 4. Insert Transactions into the Trie
    for (let i = 0; i < block.transactions.length; i++) {
        const tx = block.transactions[i];
        const key = RLP.encode(i);
        
        // Skip if tx is a string (hash only)
        if (typeof tx === 'string') {
            continue;
        }
        
        // Normalize transaction type
        let txType = 0;
        if (tx.type !== undefined) {
            if (typeof tx.type === 'string') {
                // For hex string types like '0x2'
                const typeStr = tx.type as string;
                if (typeStr.startsWith('0x')) {
                    txType = parseInt(typeStr.slice(2), 16);
                } else {
                    txType = parseInt(typeStr, 10);
                }
            } else {
                // For numeric types
                txType = Number(tx.type);
            }
        }
        
        let serializedTx;
        
        try {
            // Prepare transaction data
            const txData = {
                nonce: tx.nonce,
                gasLimit: tx.gas,
                to: tx.to ? tx.to.toString() : undefined, // Convert empty to to undefined
                value: tx.value,
                data: tx.input || tx.data || '0x',
                v: tx.v,
                r: tx.r,
                s: tx.s,
                chainId: tx.chainId || chainId
            };
            
            // Create the appropriate transaction object based on type
            if (txType === 2) {
                // EIP-1559 transaction
                const eip1559TxData = {
                    ...txData,
                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                    maxFeePerGas: tx.maxFeePerGas,
                    accessList: tx.accessList ? tx.accessList : []
                };

                // Cast the transaction data to the expected type
                const eip1559Tx = FeeMarketEIP1559Transaction.fromTxData(eip1559TxData as any, { common });
                serializedTx = eip1559Tx.serialize();
            } else if (txType === 1) {
                // EIP-2930 transaction
                const eip2930TxData = {
                    ...txData,
                    gasPrice: tx.gasPrice,
                    accessList: tx.accessList ? tx.accessList : []
                };
                
                // Cast the transaction data to the expected type
                const eip2930Tx = AccessListEIP2930Transaction.fromTxData(eip2930TxData as any, { common });
                serializedTx = eip2930Tx.serialize();
            } else {
                // Legacy transaction
                const legacyTxData = {
                    ...txData,
                    gasPrice: tx.gasPrice
                };

                // Cast the transaction data to the expected type
                const legacyTx = LegacyTransaction.fromTxData(legacyTxData as any, { common });
                serializedTx = legacyTx.serialize();
            }
            
            // Add to trie
            await trie.put(key, serializedTx);
            
            // Log for debugging
            if (typeof txRaw.transactionIndex === 'string' ? 
                i === parseInt(txRaw.transactionIndex) : 
                i === Number(txRaw.transactionIndex)) {
                if (LOGGING_ENABLED) {
                    console.log(`Added target transaction ${typeof tx === 'string' ? tx : tx.hash} at index ${i}`);
                }
            }
        } catch (error) {
            console.error(`Error serializing transaction at index ${i}:`, error);
            
            if (LOGGING_ENABLED) console.log('Transaction data:', JSON.stringify(tx, null, 2));
            throw error; // Re-throw to stop execution and see the error
        }
    }

    // 5. Generate Proof
    const txIdx = typeof txRaw.transactionIndex === 'string' ? 
        parseInt(txRaw.transactionIndex) : 
        Number(txRaw.transactionIndex);
    const txIndex = RLP.encode(txIdx);
    const proof = await trie.createProof(txIndex);
    const value = await trie.get(txIndex);

    if (!proof || proof.length === 0) {
        console.error("❌ Failed to generate proof");
        return;
    }

    // 6. Validate the Trie Root matches Block Header
    const computedRoot = Buffer.from(trie.root()).toString('hex');
    if (LOGGING_ENABLED) {
        console.log(`Computed root: 0x${computedRoot}`);
        console.log(`Block transactions root: ${block.transactionsRoot}`);
    }

    if (`0x${computedRoot}` === block.transactionsRoot) {
        if (LOGGING_ENABLED) {
            console.log("✅ Computed Transactions Trie Root Matches Block Header");
        }
    } else {
        console.error("❌ Mismatch in Computed Transactions Root");
            
        // Additional debugging information
        if (LOGGING_ENABLED) {
            console.log(`Difference in length: ${computedRoot.length} vs ${block.transactionsRoot.slice(2).length}`);
        }
        // Check if the first few transactions are serialized correctly
        for (let i = 0; i < Math.min(3, block.transactions.length); i++) {
            const tx = block.transactions[i];
            if (typeof tx !== 'string') {
                console.log(`Transaction ${i} hash: ${tx.hash}`);
                
                // Try to get the raw transaction
                try {
                    const rawTx = await web3.eth.getTransaction(tx.hash);
                    if (LOGGING_ENABLED) console.log(`Raw transaction ${i}:`, rawTx);
                } catch (e) {
                    if (LOGGING_ENABLED) console.log(`Could not get raw transaction ${i}`);
                }
            }
        }
    }

    const txReceipt = await web3.eth.getTransactionReceipt(txHash);

    if (txRaw.blockHash !== txReceipt.blockHash) {
        console.error("❌ Block hash mismatch");
        return;
    }

    if (Number(txRaw.transactionIndex) !== Number(txReceipt.transactionIndex)) {
        console.error("❌ Transaction index mismatch");
        return;
    }

    // 3. Initialize a Merkle Patricia Trie
    const receiptTrie = new Trie();

    // 4. Get all transaction receipts for the block
    const receipts = await Promise.all(
        block.transactions.map(tx => {
            if (typeof tx === 'string') {
                return web3.eth.getTransactionReceipt(tx);
            } else {
                return web3.eth.getTransactionReceipt(tx.hash);
            }
        })
    );
    
    // 5. Insert receipts into the trie
    for (let i = 0; i < receipts.length; i++) {
        const txReceipt = receipts[i];
        const key = RLP.encode(i);
        
        // Encode receipt based on its type
        const encodedReceipt = encodeReceipt(txReceipt);
        
        // Add to trie
        await receiptTrie.put(key, encodedReceipt);
    }

    // 6. Generate Proof
    const receiptProof = await receiptTrie.createProof(txIndex);
    const receiptValue = await receiptTrie.get(txIndex);
    
    // 7. Validate the Trie Root matches Block Header
    const computedReceiptRoot = Buffer.from(receiptTrie.root()).toString('hex');
    if (LOGGING_ENABLED) {
        console.log(`Computed receipts root: 0x${computedReceiptRoot}`);
        console.log(`Block receipts root: ${block.receiptsRoot}`);
    }

    if (`0x${computedReceiptRoot}` === block.receiptsRoot) {
        if (LOGGING_ENABLED) console.log("✅ Computed Receipts Trie Root Matches Block Header");
    } else {
        console.error("❌ Mismatch in Computed Receipts Root");
    }

    return {
        txHash,
        txRaw,
        txReceipt,
        block,
        txProof: proof,
        txEncodedValue: value,
        receiptProof: receiptProof,
        receiptEncodedValue: receiptValue
    };
}

async function verifyTransactionProof(txHash: `0x${string}`, transactionIndex: number | string | bigint, block: any, proof: any, value: any) {
    
    // 1. The key is the RLP encoded transaction index
    const txIdx = typeof transactionIndex === 'string' ? 
        parseInt(transactionIndex) : 
        Number(transactionIndex);
    const key = RLP.encode(txIdx);

    // 2. Convert the block's transactionsRoot to Buffer
    const expectedRoot = typeof block.transactionsRoot === 'string' && block.transactionsRoot.startsWith('0x')
        ? Buffer.from(block.transactionsRoot.slice(2), 'hex')
        : Buffer.from(block.transactionsRoot);
    // 3. Verify the proof using Trie.verifyProof
    try {
        // Verify the proof against the expected root
        const trie = new Trie()
        const verifiedValue = await trie.verifyProof(expectedRoot, key, proof);

        if (!verifiedValue) {
            console.error("❌ Proof verification failed - no value returned");
            return false;
        }
        
        // Check if the verified value matches the expected value
        const valueMatches = Buffer.compare(verifiedValue, value) === 0;
        
        if (!valueMatches) {
            console.error("❌ Proof verification failed - value mismatch");
            console.log("Expected:", value?.toString?.() || "null");
            console.log("Got:", verifiedValue?.toString?.() || "null");
            return false;
        }
        
        if (LOGGING_ENABLED) {
            console.log("✅ Proof verification successful!");
            console.log(`Transaction ${txHash} is confirmed to be in block`);
        }
        return true;
    } catch (error) {
        console.error("❌ Proof verification error:", (error as Error).message);
        return false;
    }
}


function serializeWithBigInt(obj: any) {
    return JSON.stringify(obj, (_, value: any) => {
        // Convert BigInt to string with numeric format
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    });
}

// Example usage
export async function getTransactionProofData(txHash: `0x${string}`, chainId: number) {
    try {
        const proofData = await getTransactionProof(txHash, chainId);

        if (!proofData) {
            throw new Error("Proof data not found");
        }

        const isValid = await verifyTransactionProof(
            proofData.txHash, 
            proofData.txReceipt.transactionIndex, 
            proofData.block, 
            proofData.txProof, 
            proofData.txEncodedValue
        );

        if (!isValid) {
            throw new Error("Proof is invalid");
        }
    
        return serializeWithBigInt({
            TxHash: proofData.txHash,
            TxRoot: proofData.block.transactionsRoot,
            TxIndex: proofData.txReceipt.transactionIndex.toString(),
            TxRaw: proofData.txRaw,
            TxReceipt: proofData.txReceipt,
            TxProof: proofData.txProof?.map((n: any) => Array.from(n)) || [],
            TxEncodedValue: proofData.txEncodedValue ? Array.from(proofData.txEncodedValue) : [],
            ReceiptRoot: proofData.block.receiptsRoot,
            ReceiptProof: proofData.receiptProof?.map((n: any) => Array.from(n)) || [],
            ReceiptEncodedValue: proofData.receiptEncodedValue ? Array.from(proofData.receiptEncodedValue) : []
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

export function isTxHash(value: string): boolean {
    return /^0x([A-Fa-f0-9]{64})$/.test(value);
}
