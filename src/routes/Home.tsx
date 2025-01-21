import React, {useState} from "react";
import BlockNote from "../components/BlockNote.tsx";
import { Button, ModeToggle, Text, useTheme } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useDocumentStore } from '../store/documentStore';
import { createSignatureVC } from '../utils/veramoUtils';
import EthSignDialog from "../blocks/EthSignDialog";
import { useAccount } from "wagmi";
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import ImportDialog from "../components/ImportDialog.tsx";
import {schema} from "../blocks/BlockNoteSchema.tsx";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import ExportDialog from "../components/ExportDialog.tsx";
import ImportSignatureDialog from "../components/ImportSignatureDialog.tsx";

const Home: React.FC = () => {
  const { mode } = useTheme();
  const [sigVC, setSigVC] = useState<string>('');
  const { editorMode, setEditorMode } = useBlockNoteStore();

  const getButtonVariant = (buttonType: BlockNoteMode) => buttonType === editorMode ? "outline" : "default";

  const { editDocumentState, signaturesState: {numOfSignedSignatureBlocks, numOfSignatureBlocks}, signatories, documentVC } = useDocumentStore();

  const { address } = useAccount();

  const editor = useCreateBlockNote({
    schema,
    initialContent: editDocumentState
  })

  const handleSignDocument = async () => {
    // Validation
    if (!address) throw new Error('Not signed in');

    if (!signatories.find((a) => a === address)) throw new Error('You are not a signer for this document');

    if (numOfSignedSignatureBlocks !== numOfSignatureBlocks) {
      throw new Error('No signatures');
    }

    const signatureVC = await createSignatureVC(address, editDocumentState, documentVC);
    setSigVC(signatureVC);
  }

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full">
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between m-3 rounded-3">
          <h1 className="text-lg font-bold">APOC</h1>
          <div className="flex space-x-4">
            <Button
              variant={getButtonVariant(BlockNoteMode.EDIT)}
              onPress={() => setEditorMode(BlockNoteMode.EDIT)}
            >
              <Text>Agreement Editor</Text>
            </Button>
            <Button
              variant={getButtonVariant(BlockNoteMode.SIGNATURE)}
              onPress={() => setEditorMode(BlockNoteMode.SIGNATURE)}
            >
              <Text>Signing Simulation</Text>
            </Button>
            <Button
              variant={getButtonVariant(BlockNoteMode.VIEW)}
              onPress={() => setEditorMode(BlockNoteMode.VIEW)}
            >
              <Text>Signing Data Log</Text>
            </Button>
          </div>
          { editorMode === BlockNoteMode.SIGNATURE &&
            <Button disabled={!sigVC} onPress={() => {navigator.clipboard.writeText(sigVC)}}><Text>Copy Sig VC</Text></Button>
          }
          { editorMode === BlockNoteMode.EDIT &&
            <>
              <ExportDialog />
              <Button disabled={!documentVC} onPress={() => {navigator.clipboard.writeText(documentVC)}}><Text>Copy Doc VC</Text></Button>
              <ImportDialog editor={editor} />
              <ImportSignatureDialog />
            </>
          }
          <div className="flex space-x-4">
            <Account />
            <ModeToggle />
          </div>

        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] p-4">
            { editorMode === BlockNoteMode.SIGNATURE &&
              <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                <Text>Review the document, fill in all details required, and sign all signature blocks {numOfSignedSignatureBlocks}/{numOfSignatureBlocks}</Text>
                <div className="flex space-x-4">
                  <EthSignDialog onPressSign={handleSignDocument} disabled={numOfSignedSignatureBlocks !== numOfSignatureBlocks}/>
                </div>
              </div>
            }
            <BlockNote editor={editor} theme={mode} editorMode={editorMode}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;