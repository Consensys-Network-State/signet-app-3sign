import React from "react";
import { Button, ModeToggle, Text } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import BNDocumentView from "../components/BNDocumentView.tsx";

const Home: React.FC = () => {
  const { editorMode, setEditorMode } = useBlockNoteStore();

  const getButtonVariant = (buttonType: BlockNoteMode) => buttonType === editorMode ? "outline" : "default";

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
              variant={getButtonVariant(BlockNoteMode.SIMULATION)}
              onPress={() => setEditorMode(BlockNoteMode.SIMULATION)}
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
          <div className="flex space-x-4">
            <Account />
            <ModeToggle />
          </div>

        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] p-4">
            <BNDocumentView />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;