import React from "react";
import BlockNote from "../components/BlockNote.tsx";
import { Button, ModeToggle, Text, useTheme } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useDocumentStore } from '../store/documentStore';
import {
  Block,
} from '@blocknote/core';
import _ from 'lodash';
import { setupAgent } from '../veramo';
import EthSignDialog from "../blocks/EthSignDialog";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from "wagmi";
import { ethers } from 'ethers';
import { useEditorStore } from '../store/editorStore';

export enum BlockEditorMode {
  EDITOR = "EDITOR",
  SIMULATOR = "SIMULATOR",
  LOG = "LOG"
}

// TODO: Change Later as needed
interface Signature {
  blockId: string,
  name: string,
  address: string,
}

const Home: React.FC = () => {
  const { mode } = useTheme();
  const { editorMode, setEditorMode} = useEditorStore();

  const getButtonVariant = (buttonType: BlockEditorMode) => buttonType === editorMode ? "outline" : "default";

  const { editDocumentState, signaturesState: {numOfSignedSignatureBlocks, numOfSignatureBlocks} } = useDocumentStore();

  const { address } = useAccount();

  const handleSignDocument = async () => {
    // Validation
    if (numOfSignedSignatureBlocks !== numOfSignatureBlocks) {
      throw new Error('No signatures');
    }

    // Split Signatures From Document
    // TODO: Need to do a deep search for signature blocks
    //       In later phase add signatures to the VC
    const document = _.cloneDeep(editDocumentState);
    const signatures: Signature[] = [];
    _.filter(document, (block: Block) => block.type === 'signature').forEach((sigBlock: Block) => {
      signatures.push({ blockId: sigBlock.id, name: sigBlock.props.name, address: sigBlock.props.address });
      delete sigBlock.props.name;
      delete sigBlock.props.address;
    });

    const agent = await setupAgent();
    
    // Sign Base Document with Metamask

    const did = await agent.didManagerGet({ did: `did:pkh:eip155:1:${address}` });

    // Construct VC from this
    const vc = await agent.createVerifiableCredential({
      credential: {
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
          documentHash: ethers.keccak256(new TextEncoder().encode(JSON.stringify(document))),
          timeStamp: new Date().toISOString(),
        },
      },
      proofFormat: 'jwt',
    });

    // TODO: Display VC somewhere for user to copy
    console.log(JSON.stringify(vc));
  }

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full">
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between m-3 rounded-3">
          <h1 className="text-lg font-bold">APOC</h1>
          <div className="flex space-x-4">
            <Button
              variant={getButtonVariant(BlockEditorMode.EDITOR)}
              onPress={() => setEditorMode(BlockEditorMode.EDITOR)}
            >
              <Text>Agreement Editor</Text>
            </Button>
            <Button
              variant={getButtonVariant(BlockEditorMode.SIMULATOR)}
              onPress={() => setEditorMode(BlockEditorMode.SIMULATOR)}
            >
              <Text>Signing Simulation</Text>
            </Button>
            <Button
              variant={getButtonVariant(BlockEditorMode.LOG)}
              onPress={() => setEditorMode(BlockEditorMode.LOG)}
            >
              <Text>Signing Data Log</Text>
            </Button>
          </div>

          <div className="flex space-x-4">
            <Account />
            <ModeToggle />
          </div>

        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] p-4">
            { editorMode === BlockEditorMode.SIMULATOR &&
              <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                <Text>Review the document, fill in all details required, and sign all signature blocks {numOfSignedSignatureBlocks}/{numOfSignatureBlocks}</Text>
                <div className="flex space-x-4">
                  <EthSignDialog onPressSign={handleSignDocument} disabled={numOfSignedSignatureBlocks !== numOfSignatureBlocks}/>
                </div>
              </div>
            }
            <BlockNote theme={mode} editorMode={editorMode}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;