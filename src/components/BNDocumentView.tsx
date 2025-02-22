import "@blocknote/core/fonts/inter.css";
import {BlockNoteView} from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote, useBlockNoteContext} from "@blocknote/react";
import {filterSuggestionItems, insertOrUpdateBlock,} from '@blocknote/core';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icons,
  Text,
  Icon,
  useTheme,
} from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
import {BlockNoteMode, useBlockNoteStore} from '../store/blockNoteStore';
import {Block, schema} from "../blocks/BlockNoteSchema.tsx";
import EthSignDialog from "./EthSignDialog.tsx";
import ExportDialog from "./ExportDialog.tsx";
import newAgreement from '../templates/grant-agreement.json';
import {DocumentPayload} from "../types";
import * as React from "react";
import ViewSignatureDialog from "./ViewSignatureDialog.tsx";
import Layout from "../layouts/Layout.tsx";
import {View} from "react-native";
import {COLOR_MODES} from "@ds3/config";
import AddressCard from "../web3/AddressCard.tsx";
import {Share2, ShieldCheck, Calendar} from 'lucide-react-native';
import {InputClipboard} from "./InputClipboard.tsx";
import {constructBNDocumentFromDocumentPayload} from "../utils/documentUtils.ts";
import ClearAllDialog from "./ClearAllDialog.tsx";
import {useEditStore} from "../store/editorStore.ts";
import { useAccount, useSwitchChain } from "wagmi";
import { mainnet } from 'viem/chains';
import ChainAvatar from "../web3/ChainAvatar.tsx";
import { Wallet } from 'lucide-react-native';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  TextAlignButton,
} from "@blocknote/react";
import { isAddress } from 'viem';

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

const WalletAddressButton = () => {
  const { editor } = useBlockNoteContext() as { editor: typeof schema.BlockNoteEditor };
  
  const handleClick = () => {
    const selection = editor.getSelection();
    if (selection) {
      const selectedText = editor.getSelectedText();
      // Check if selected text is a valid Ethereum address
      if (selectedText && isAddress(selectedText)) {
        // Replace the selected text with wallet address inline content
        editor.insertInlineContent([
          {
            type: "walletAddress",
            props: {
              address: selectedText,
            },
          },
        ]);
      } else {
        // If selected text is not a valid address, insert default address
        editor.insertInlineContent([
          {
            type: "walletAddress",
            props: {
              address: "0x0000000000000000000000000000000000000000",
            },
          },
        ]);
      }
    } else {
      // If no text is selected, insert default address
      editor.insertInlineContent([
        {
          type: "walletAddress",
          props: {
            address: "0x0000000000000000000000000000000000000000",
          },
        },
      ]);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onPress={handleClick}
      className="flex h-8 w-8 items-center justify-center"
    >
      <Icon icon={Wallet} size={16} />
    </Button>
  );
};

const handleAddressInsert = (editor: typeof schema.BlockNoteEditor, address: string = "") => {
  editor.insertInlineContent([
    {
      type: "walletAddress",
      props: {
        address,
      },
    },
  ]);
};

const handleDateTimeInsert = (editor: typeof schema.BlockNoteEditor) => {
  editor.insertInlineContent([
    {
      type: "dateTime",
      props: {
        date: "",
        showTime: false
      },
    },
  ]);
};

const BNDocumentView: React.FC<BNDocumentViewProps> = ({ documentPayload, ...props }) => {
  const { mode } = useTheme();
  const { editState, setEditState } = useEditStore();
  const [editorMode, setEditorMode] = React.useState<BlockNoteMode | null>(null);
  const { editorMode: currentEditorMode } = useBlockNoteStore();

  const editor = useCreateBlockNote({
    schema,
    initialContent: documentPayload ?
      constructBNDocumentFromDocumentPayload(documentPayload) :
        editState && currentEditorMode === BlockNoteMode.EDIT ?
          editState as Block[]:
          newAgreement as Block[]
  })

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false);
  const [sigVC, setSigVC] = React.useState('');
  const onSuccessfulSignature = (signatureVC: string) => {
    setSigVC(signatureVC);
    setIsSuccessDialogOpen(true);
  }

  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain()

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

  const isWrongChain = React.useMemo(() => chainId !== mainnet.id, [chainId]);

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
      return <>
        <ExportDialog editor={editor} disabled={isWrongChain} />
        <ClearAllDialog editor={editor} />
      </>
    }

    else if (editorMode === BlockNoteMode.SIMULATION) {
      return <EthSignDialog editor={editor} isSimulationMode disabled={isWrongChain} />
    }

    else if (editorMode === BlockNoteMode.SIGNATURE) {
      return <EthSignDialog editor={editor} documentPayload={documentPayload!} onSuccessfulSignature={onSuccessfulSignature} disabled={isWrongChain} />
    }

    return <></>
  }, [editorMode, documentStatus, documentPayload, editor, isWrongChain]);

  const statusBar = React.useMemo(() => {
    if (isWrongChain && currentEditorMode !== BlockNoteMode.VIEW) {
      return {
        type: 'primary',
        message: `Switch to Mainnet Ethereum to ${editorMode === BlockNoteMode.SIGNATURE ? 'sign' : 'publish'} this document...`,
        actions:  <Button variant="soft" className="bg-primary-6" onPress={() => switchChain({ chainId: mainnet.id })}>
          <ChainAvatar chainId={mainnet.id}/>
          <Button.Text>Switch to Mainnet</Button.Text>
        </Button>,
      }
    }
    if (currentEditorMode === BlockNoteMode.SIGNATURE) {
      return {
        type: 'primary',
        message: 'Review the document, fill in all required fields before signing.'
      }
    }

    return undefined;
  }, [editorMode, switchChain, currentEditorMode, isWrongChain]) as {
    message: string;
    type?: 'warning' | 'info' | 'error';
    actions?: React.ReactNode;
  } | undefined;

  const onEdit = () => {
    if (editorMode === BlockNoteMode.EDIT) {
      setEditState(editor.document);
    }
  }

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
      editor={editor}
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
                      <Button className="my-auto ml-auto" variant="soft" disabled={!(documentPayload!.raw.IsComplete)} color={documentPayload!.raw.IsComplete ? "success" : "neutral" }>
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
        onChange={onEdit}
        editor={editor}
        editable={editorMode === BlockNoteMode.EDIT}
        slashMenu={false}
        theme={mode || 'light'}
        formattingToolbar={false}
        {...props}
      >
        <>
          <SuggestionMenuController
            triggerCharacter="@"
            getItems={async (query) => {
              return [
                {
                  title: "Insert Address",
                  onItemClick: () => {
                    handleAddressInsert(editor);
                  },
                  icon: <Icon icon={Wallet} size={16} />,
                },
                {
                  title: "Insert Date",
                  onItemClick: () => {
                    handleDateTimeInsert(editor);
                  },
                  icon: <Icon icon={Calendar} size={16} />,
                }
              ];
            }}
          />

          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  insertSablier(editor),
                  insertSignature(editor),
                ],
                query
              )
            }
          />

          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                <BlockTypeSelect />
                <BasicTextStyleButton basicTextStyle="bold" />
                <BasicTextStyleButton basicTextStyle="italic" />
                <BasicTextStyleButton basicTextStyle="underline" />
                <BasicTextStyleButton basicTextStyle="strike" />
                <TextAlignButton textAlignment="left" />
                <TextAlignButton textAlignment="center" />
                <TextAlignButton textAlignment="right" />
                <ColorStyleButton />
                <CreateLinkButton />
                <WalletAddressButton />
              </FormattingToolbar>
            )}
          />
        </>
      </BlockNoteView>
    </Layout>
  </>
}

export default BNDocumentView;