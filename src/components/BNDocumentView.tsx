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
  DialogTitle, DialogTrigger,
  Icons,
  Text,
  useTheme,
  DialogClose,
} from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
import { BlockNoteMode, useBlockNoteStore } from '../store/blockNoteStore';
import { Block, schema } from "../blocks/BlockNoteSchema.tsx";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import EthSignDialog from "./EthSignDialog.tsx";
import ExportDialog from "./ExportDialog.tsx";
import newAgreement from '../templates/new-agreement.json';
// import grantAgreement from '../templates/grant-agreement.json';
import { DocumentPayload } from "../types";
import * as React from "react";
import ViewSignatureDialog from "./ViewSignatureDialog.tsx";
import Layout from "../layouts/Layout.tsx";
import { View } from "react-native";
import {COLOR_MODES} from "@ds3/config";
import AddressCard from "../web3/AddressCard.tsx";
import { ShieldCheck, Share2 } from 'lucide-react-native';
import {InputClipboard} from "./InputClipboard.tsx";

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
  // Add other properties of `props` if necessary
  [key: string]: unknown; // Optional: For additional props
}

const BNDocumentView: React.FC<BNDocumentViewProps> = ({ documentPayload, ...props }) => {
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
  }, [currentEditorMode, editorMode, editor, tempStateStore]);

  const documentStatus = React.useMemo(() => {
    if (documentPayload) {
      if (documentPayload.raw.IsComplete) return DocumentStatus.SIGNED;
      return DocumentStatus.UNSIGNED;
    }
    return DocumentStatus.UNDEFINED;
  }, [documentPayload]);


  const headerButtons = React.useMemo(() => {
    if (editorMode === BlockNoteMode.VIEW) {
      return <>
        { documentStatus === DocumentStatus.SIGNED &&
          // TODO: We're just displaying one signature for now. This will need to change when supporting multiple signatures
            <ViewSignatureDialog sigVC={Object.values(documentPayload!.raw.Signatures)[0]}>
                <Button variant='soft'>
                    <Button.Icon icon={ShieldCheck} />
                    <Button.Text>View VC</Button.Text>
                </Button>
            </ViewSignatureDialog>
        }
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="soft">
              <Button.Icon icon={Share2}/>
              <Button.Text>Share</Button.Text>
            </Button>
          </DialogTrigger>
          <DialogContent className='w-[520px] max-w-[520px]'>
            <DialogHeader>
              <DialogTitle>Share</DialogTitle>
              <DialogDescription>
                <Text>Shareable link to this agreement</Text>
              </DialogDescription>
            </DialogHeader>
            <InputClipboard value={`${window.location.origin}${location.pathname}`} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='soft' color="primary">
                  <Text>Close</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
  }, [editorMode, documentStatus, documentPayload, editor]);

  const statusBar = React.useMemo(() => {
    if (editorMode === BlockNoteMode.SIGNATURE) {
      return {
        type: 'warning',
        message: 'Review the document, fill in all required fields before signing.'
      }
    }

    return undefined;
  }, [editorMode]);

  return <>
    <Dialog open={isSuccessDialogOpen}>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Success!</DialogTitle>
          <DialogDescription>
            <Text className="block pb-4">You have successfully signed this agreement</Text>

            <Text className="block">This is your portable VC:</Text>
          </DialogDescription>
        </DialogHeader>
        <InputClipboard value={sigVC} multiline numberOfLines={12} />
        <DialogFooter>
          <Button variant='soft' color="primary" onPress={() => setIsSuccessDialogOpen(false)}>
            <Text>Close</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Layout
      rightHeader={headerButtons}
      status={statusBar}
    >
      { (editorMode === BlockNoteMode.VIEW || editorMode === BlockNoteMode.SIGNATURE) &&
        <View className="grid grid-cols-2 gap-4 mb-4">
          <View className={`flex flex-col shadow-lg w-full h-32 px-8 py-6 rounded-md ${mode === COLOR_MODES.Dark ? 'bg-neutral-3': ''}`}>
            <Text className="font-light text-4 mb-4">Agreement Author</Text>
            <View className="flex flex-row items-center h-12">
              <AddressCard address={documentPayload!.raw.DocumentOwner}/>
              <View className="my-auto ml-auto">
                <ViewSignatureDialog sigVC={documentPayload!.raw.Document}>
                  <Button variant="soft" color="success">
                      <Button.Icon icon={Icons.Signature} />
                      <Button.Text>View Signature</Button.Text>
                  </Button>
                </ViewSignatureDialog>
              </View>

            </View>
          </View>
          <View className={`flex flex-col shadow-lg w-full h-32 px-8 py-6 rounded-md ${mode === COLOR_MODES.Dark ? 'bg-neutral-3': ''}`}>
            <Text className="font-light text-4 mb-4">Agreement Signatory</Text>
              <View className="flex flex-row items-center h-12">
                <AddressCard address={documentPayload!.raw.Signatories[0]}/>
                <View className="my-auto ml-auto">
                  <ViewSignatureDialog sigVC={documentPayload!.raw.IsComplete ? Object.values(documentPayload!.raw.Signatures)[0] : ''}>
                      <Button className="my-auto ml-auto" variant="soft" disabled={!(documentPayload!.raw.IsComplete)} color={documentPayload!.raw.IsComplete ? "success" : "error" }>
                          <Button.Icon icon={Icons.Signature} />
                          <Button.Text>{documentPayload!.raw.IsComplete ? "View Signature" : "Not Signed"}</Button.Text>
                      </Button>
                  </ViewSignatureDialog>
                </View>
              </View>
          </View>
        </View>
      }
      <BlockNoteView
        className="shadow-lg"
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
      {/*{ currentEditorMode === BlockNoteMode.SIGNATURE &&*/}
      {/*  <EthSignDialog*/}
      {/*    editor={editor}*/}
      {/*    documentPayload={documentPayload!}*/}
      {/*    onSuccessfulSignature={onSuccessfulSignature}*/}
      {/*    triggerProps={{*/}
      {/*      color: 'primary',*/}
      {/*      variant: 'soft',*/}
      {/*      size: 'lg',*/}
      {/*      className: 'mt-4 w-full'*/}
      {/*    }}*/}
      {/*  />*/}
      {/*}*/}
    </Layout>
  </>
}

export default BNDocumentView;