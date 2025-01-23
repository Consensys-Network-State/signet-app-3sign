import {v4 as uuidv4} from "uuid";
import {setupAgent} from "../veramo";
import {ethers} from 'ethers';
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {separateSignaturesFromDocument} from "./documentUtils.ts";
import SymmetricCrypto from "./symmetricCrypto.ts";

export const encodeObjectToBase64 = (obj: any) => {
    try {
        const jsonString = JSON.stringify(obj); // Convert object to JSON string
        const utf8String = new TextEncoder().encode(jsonString); // Convert to UTF-8 encoded Uint8Array
        return btoa(String.fromCharCode(...utf8String)); // Convert Uint8Array to Base64 string
    } catch (error) {
        console.error("Failed to encode object to Base64:", error);
        return null;
    }
};

export const decodeBase64ToObject = (base64String: string) => {
    try {
        const utf8String = atob(base64String); // Decode Base64 to string
        const jsonString = new TextDecoder().decode(new Uint8Array([...utf8String].map((c) => c.charCodeAt(0))));
        return JSON.parse(jsonString); // Parse JSON string back to an object
    } catch (error) {
        console.error("Failed to decode Base64 to object:", error);
        return null;
    }
};

export async function getDIDFromAddress(address: `0x${string}`) {
    const agent = await setupAgent();
    return await agent.didManagerGet({did: `did:pkh:eip155:1:${address}`});
}

export async function signVCWithEIP712(credential: any) {
    const agent = await setupAgent();

    const vc = await agent.createVerifiableCredential({
        credential,
        proofFormat: 'EthereumEip712Signature2021',
    });
    const verificationResult = await agent.verifyCredential({ credential: vc });
    if (!verificationResult.verified) throw new Error('Failed to sign document');
    return vc;
}
export async function createDocumentVC(address: `0x${string}`, signatories: `0x${string}`[], documentState: Block[]) {
    const { document } = separateSignaturesFromDocument(documentState);
    const docStr = JSON.stringify(document);
    let encryptSerialized;
    let exportedKey;

    // Generate a key
    const encryptionKey = await SymmetricCrypto.generateKey();
    
    // Encrypt the message
    const encrypted = await SymmetricCrypto.encrypt(docStr, encryptionKey);
    // console.log("Encrypted data:", encrypted);
    encryptSerialized = SymmetricCrypto.serializeEncryptedData(encrypted);
    // console.log("Serialized Encrypted data:", encryptSerialized);


    // Sanity check - decrypt the message and match it with original
    // const deceriazliedEncrypted = SymmetricCrypto.deserializeEncryptedData(encryptSerialized);
    // const decrypted = await SymmetricCrypto.decrypt(deceriazliedEncrypted, encryptionKey);
    // console.log("Original equals decrypted:", docStr === decrypted);

    exportedKey = await SymmetricCrypto.exportKey(encryptionKey);

    const did = await getDIDFromAddress(address);

    const vc = await signVCWithEIP712(
        {
            id: uuidv4(),
            issuer: { id: did.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: [
                'VerifiableCredential',
                'Agreement',
            ],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: did.did,
                document: encryptSerialized,
                timeStamp: new Date().toISOString(),
                signatories,
            },
        }
    );

    const stringVC = JSON.stringify(vc);
    console.log(stringVC)
    return { stringVC, encryptionKey: exportedKey };
}

export async function decryptDocument(document: string, encryptionKey: string) {
    // Import the given key and decrypt the message
    const key = await SymmetricCrypto.importKey(encryptionKey);
    const deceriazliedEncrypted = SymmetricCrypto.deserializeEncryptedData(document)
    const decrypted = await SymmetricCrypto.decrypt(deceriazliedEncrypted, key);
    // console.log("Decrypted message:", decrypted);
    return decrypted;
}

export async function createSignatureVC(address: `0x${string}`, _documentState: Block[], documentVC: string) {
    // TODO: Do something with signatures
    // const { document, signatures } = separateSignaturesFromDocument(documentState);

    const did = await getDIDFromAddress(address);

    // Construct VC from this
    const vc = await signVCWithEIP712(
        {
            id: uuidv4(),
            issuer: { id: did.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: [
                'VerifiableCredential',
                'SignedAgreement',
            ],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: did.did,
                documentHash: ethers.keccak256(new TextEncoder().encode(documentVC)),
                timeStamp: new Date().toISOString(),
            },
        }
    );
    const stringVC = JSON.stringify(vc);
    console.log(stringVC)
    return stringVC;
}

export async function validateAndProcessDocumentVC(vc: any, encryptionKey: string) {
    const agent = await setupAgent();
    const verificationResult = await agent.verifyCredential({ credential: vc });
    if (!verificationResult.verified) throw new Error('Failed to sign document');
    // How do we check if the issuer of the VC is the correct person
    const decryptedDocument = await decryptDocument(vc.credentialSubject.document, encryptionKey);
    return {
        document: JSON.parse(decryptedDocument) as Block[],
        signatories: vc.credentialSubject.signatories,
    }
}