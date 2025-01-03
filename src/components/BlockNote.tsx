import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import {
  // Block,
  BlockNoteSchema,
  defaultBlockSpecs,
  insertOrUpdateBlock,
  filterSuggestionItems,
} from '@blocknote/core';
import grantAgreement from '../templates/grant-agreement.json';
import { SablierBlock } from '../blocks/SablierBlock'
import { SignatureBlock } from "../blocks/SignatureBlock";
import { Icons } from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
// import {useEffect, useState} from 'react';
import {useEffect, useState} from 'react';
import { BlockEditorMode } from '../routes/Home';

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    sablier: SablierBlock,
    signature: SignatureBlock
  },
});

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

interface BlockNoteProps {
  editorMode: BlockEditorMode;
  // Add other properties of `props` if necessary
  [key: string]: unknown; // Optional: For additional props
}

export default function BlockNote({ editorMode, ...props }: BlockNoteProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);

  // useEffect(() => {
  //   console.log(blocks);
  // }, [blocks]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: grantAgreement,
  });

  return <BlockNoteView
    // onChange={() => {
    //   // Saves the document JSON to state.
    //   setBlocks(editor.document);
    // }}
    editor={editor}
    editable={editorMode === BlockEditorMode.EDITOR}
    slashMenu={false}
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