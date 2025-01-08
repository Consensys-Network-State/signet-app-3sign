import React, { useState } from "react";
import BlockNote from "../components/BlockNote.tsx";
import { Button, ModeToggle, Text, useTheme } from "@ds3/react";
import Account from "../web3/Account.tsx";
import useStore from '../store/index';
import {
  Block,
} from '@blocknote/core';
import _ from 'lodash';

export enum BlockEditorMode {
  EDITOR = "EDITOR",
  SIMULATOR = "SIMULATOR",
  LOG = "LOG"
}

const Home: React.FC = () => {
  const { mode } = useTheme();
  const [editorMode, setEditorMode] = useState(BlockEditorMode.EDITOR);

  const getButtonVariant = (buttonType: BlockEditorMode) => buttonType === editorMode ? "outline" : "default";

  const { editDocumentState, signaturesState: {numOfSignedSignatureBlocks, numOfSignatureBlocks} } = useStore();

  const handleSignDocument = async () => {
    console.log('signing')
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
        { editorMode === BlockEditorMode.SIMULATOR && 
            <div className="bg-primary-9 p-2 flex items-center justify-between m-3 rounded-3">
                <Text>Review the document, fill in all details required, and sign all signature blocks {numOfSignedSignatureBlocks}/{numOfSignatureBlocks}</Text>
                <div className="flex space-x-4">
                  <Button
                    onPress={handleSignDocument}
                  >
                    <Text>Sign</Text>
                  </Button>
                </div>
            </div>
        }
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] p-4">
            <BlockNote theme={mode} editorMode={editorMode}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;