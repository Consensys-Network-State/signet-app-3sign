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
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  Icons,
  InputField,
  Text,
  useTheme
} from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
import {BlockNoteMode, useBlockNoteStore} from '../store/blockNoteStore';
import {Block, schema} from "../blocks/BlockNoteSchema.tsx";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import EthSignDialog from "./EthSignDialog.tsx";
import ExportDialog from "./ExportDialog.tsx";
import newAgreement from '../templates/new-agreement.json';
import {DocumentPayload} from "../types";
import * as React from "react";
import ViewSignatureDialog from "./ViewSignatureDialog.tsx";
import Layout from "../routes/Layout.tsx";
import { Share } from 'lucide-react-native';

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

export enum DocumentStatus {
  UNDEFINED,
  SIGNED,
  UNSIGNED,
}

interface BNDocumentViewProps {
  documentPayload?: DocumentPayload;
  documentStatus?: DocumentStatus;
  // Add other properties of `props` if necessary
  [key: string]: unknown; // Optional: For additional props
}

const BNDocumentView: React.FC<BNDocumentViewProps> = ({ documentPayload, documentStatus = DocumentStatus.UNDEFINED, ...props }) => {
  const { mode } = useTheme();
  const editor = useCreateBlockNote({
    schema,
    initialContent: documentPayload ? documentPayload.document : newAgreement as Block[]
  })

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false);
  const [sigVC, setSigVC] = React.useState('');
  const onSuccessfulSignature = (signatureVC: string) => {
    setSigVC(signatureVC);
    setIsSuccessDialogOpen(true);
  }

  const { editorMode: currentEditorMode } = useBlockNoteStore();

  const [editorMode, setEditorMode] = React.useState<BlockNoteMode | null>(null);

  const [tempStateStore, setTempStateStore] = React.useState<Block[]>([]);

  React.useEffect(() => {
    if (!editorMode) setEditorMode(currentEditorMode);
    else if (editorMode !== BlockNoteMode.SIMULATION && currentEditorMode === BlockNoteMode.SIMULATION) {
      setTempStateStore(editor.document); // DO A BACKUP
      setEditorMode(currentEditorMode);
    } else if (editorMode === BlockNoteMode.SIMULATION && currentEditorMode !== BlockNoteMode.SIMULATION) {
      editor.replaceBlocks(editor.topLevelBlocks, tempStateStore); // DO A RESTORE
      setEditorMode(currentEditorMode);
    } else {
      setEditorMode(currentEditorMode);
    }
  }, [currentEditorMode, editorMode]);


  const headerButtons = React.useMemo(() => {
    if (editorMode === BlockNoteMode.VIEW) {
      if (documentStatus === DocumentStatus.UNSIGNED) {
        return <>
          <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
            <Text>Document Is Not Signed</Text>
          </div>
          <Button variant="soft">
            <Button.Icon icon={Share}/>
            <Button.Text>Share</Button.Text>
          </Button>
        </>
      } else if (documentStatus === DocumentStatus.SIGNED) {
        // TODO: We're just displaying one signature for now. This will need to change when supporting multiple signatures
        return <>
          <ViewSignatureDialog sigVC={documentPayload?.signatures?.[0]!} />
          <Button variant="soft">
            <Button.Icon icon={Share}/>
            <Button.Text>Share</Button.Text>
          </Button>
        </>
      }
    }

    else if (editorMode === BlockNoteMode.EDIT) {
      return <ExportDialog editor={editor} />
    }

    else if (editorMode === BlockNoteMode.SIMULATION) {
      return <EthSignDialog editor={editor} isSimulationMode />
    }

    else if (editorMode === BlockNoteMode.SIGNATURE) {
      return <EthSignDialog editor={editor} documentPayload={documentPayload!} onSuccessfulSignature={onSuccessfulSignature} />
    }

    return <></>
  }, [editorMode, documentStatus]);

  const statusBar = React.useMemo(() => {
    if (editorMode === BlockNoteMode.SIGNATURE) {
      return {
        type: 'warning',
        message: 'Review the document, fill in all required fields before signing.'
      }
    }

    return undefined;
  }, [editorMode, documentStatus]);

  return <>
    <Dialog open={isSuccessDialogOpen}>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Success!</DialogTitle>
          <DialogDescription>You have successfully signed this agreement</DialogDescription>
        </DialogHeader>
        <InputField disabled value={sigVC} multiline numberOfLines={4} label={"This is your portable VC"}/>
        <DialogFooter>
          <Button variant='ghost' onPress={() => setIsSuccessDialogOpen(false)}>
            <Text>Close</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Layout
      rightHeader={headerButtons}
      status={statusBar}
    >
      <BlockNoteView
        editor={editor}
        editable={editorMode === BlockNoteMode.EDIT}
        slashMenu={false}
        theme={mode}
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
      </BlockNoteView>
    </Layout>
  </>
}

export default BNDocumentView;