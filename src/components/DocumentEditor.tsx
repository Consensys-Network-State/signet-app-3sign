import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import {
  insertOrUpdateBlock,
  filterSuggestionItems,
} from '@blocknote/core';
import { Icons } from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
import {useEffect, useState} from 'react';
import {BlockNoteMode, useBlockNoteStore} from '../store/blockNoteStore';
import { useDocumentStore } from '../store/documentStore';
import {schema} from "../blocks/BlockNoteSchema.tsx";
import {
  useCreateBlockNote,
} from "@blocknote/react";

// Slash menu item to insert an Alert block
const insertSablier = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Sablier",
  subtext: "Unlock assets on the same day each month",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "sablier",
    });
  },
  aliases: [
    "sablier",
  ],
  group: "Contract Blocks",
  icon: <SablierIcon className="w-5 h-5" />,
});

const insertSignature = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Signature",
  subtext: "Collects user signature",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "signature",
    });
  },
  aliases: [
    "signature",
  ],
  group: "Signature Blocks",
  icon: <Icons.Signature className="w-5 h-5" />,
});

interface DocumentEditorProps {
  // Add other properties of `props` if necessary
  [key: string]: unknown; // Optional: For additional props
}

export default function DocumentEditor({ ...props }: DocumentEditorProps) {
  const { updateEditDocumentState, backupEditDocumentState, tempStateStore, editDocumentState } = useDocumentStore();

  const { editorMode: currentEditorMode } = useBlockNoteStore();

  const [editorMode, setEditorMode] = useState<BlockNoteMode | null>(null);

  const editor = useCreateBlockNote({
    schema,
    initialContent: editDocumentState
  })

  // TODO: Handle Signing Log
  useEffect(() => {
    if (!editorMode) setEditorMode(currentEditorMode);
    else if (editorMode === BlockNoteMode.EDIT && currentEditorMode === BlockNoteMode.SIGNATURE) {
      backupEditDocumentState();
      setEditorMode(currentEditorMode);
    } else if (editorMode === BlockNoteMode.SIGNATURE && currentEditorMode === BlockNoteMode.EDIT) {
      editor.replaceBlocks(editor.topLevelBlocks, tempStateStore);
      setEditorMode(currentEditorMode);
    }
  }, [currentEditorMode]);

  return <BlockNoteView
    onChange={() => {
      // Saves the document JSON to state.
      updateEditDocumentState(editor.document);
    }}
    editor={editor}
    editable={editorMode === BlockNoteMode.EDIT}
    slashMenu={false}
    test={"something"}
    {...props}
  >
    <SuggestionMenuController
      triggerCharacter={"/"}
      getItems={async (query) =>
        filterSuggestionItems(
          [...getDefaultReactSlashMenuItems(editor), insertSablier(editor), insertSignature(editor)],
          query
        )
      }
    />
  </BlockNoteView>;
}