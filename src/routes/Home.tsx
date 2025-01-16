import React, {useState} from "react";
import BlockNote from "../components/BlockNote.tsx";
import { Button, ModeToggle, Text, useTheme } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useDocumentStore } from '../store/documentStore';
import { createSignatureVC } from '../utils/veramoUtils';
import EthSignDialog from "../blocks/EthSignDialog";
import { useAccount } from "wagmi";
import { useEditorStore } from '../store/editorStore';
import ImportDialog from "../components/ImportDialog.tsx";
import {schema} from "../blocks/BlockNoteSchema.tsx";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import ExportDialog from "../components/ExportDialog.tsx";

export enum BlockEditorMode {
  EDITOR = "EDITOR",
  SIMULATOR = "SIMULATOR",
  LOG = "LOG"
}

const Home: React.FC = () => {
  const { mode } = useTheme();
  const [sigVC, setSigVC] = useState<string>('');
  const [docVC, setDocVC] = useState<string>('');
  const { editorMode, setEditorMode} = useEditorStore();

  const getButtonVariant = (buttonType: BlockEditorMode) => buttonType === editorMode ? "outline" : "default";

  const { editDocumentState, signaturesState: {numOfSignedSignatureBlocks, numOfSignatureBlocks} } = useDocumentStore();

  const { address } = useAccount();

  const editor = useCreateBlockNote({
    schema,
    initialContent: editDocumentState
  })

  const handleSignDocument = async () => {
    // Validation
    if (!address) throw new Error('Not signed in');

    if (numOfSignedSignatureBlocks !== numOfSignatureBlocks) {
      throw new Error('No signatures');
    }

    const signatureVC = await createSignatureVC(address, editDocumentState);
    setSigVC(signatureVC);
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
          { editorMode === BlockEditorMode.SIMULATOR &&
            <Button disabled={!sigVC} onPress={() => {navigator.clipboard.writeText(sigVC)}}><Text>Copy Sig VC</Text></Button>
          }
          { editorMode === BlockEditorMode.EDITOR &&
            <>
              <ExportDialog onPressExport={setDocVC} />
              <Button disabled={!docVC} onPress={() => {navigator.clipboard.writeText(docVC)}}><Text>Copy Doc VC</Text></Button>
              <ImportDialog editor={editor} />
            </>
          }
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
            <BlockNote editor={editor} theme={mode} editorMode={editorMode}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;