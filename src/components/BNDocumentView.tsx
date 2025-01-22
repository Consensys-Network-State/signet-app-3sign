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
import {Icons, Text} from '@ds3/react';
import SablierIcon from "../assets/sablier.svg?react";
import {FC, useEffect, useMemo, useState} from 'react';
import {BlockNoteMode, useBlockNoteStore} from '../store/blockNoteStore';
import {Block, schema} from "../blocks/BlockNoteSchema.tsx";
import {
    useCreateBlockNote,
} from "@blocknote/react";
import EthSignDialog from "../blocks/EthSignDialog.tsx";
import ExportDialog from "./ExportDialog.tsx";
import grantAgreement from '../templates/grant-agreement.json';
import {DocumentPayload} from "../types";

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

const BNDocumentView: FC<BNDocumentViewProps> = ({ documentPayload, documentStatus = DocumentStatus.UNDEFINED, ...props }) => {
    const editor = useCreateBlockNote({
        schema,
        initialContent: documentPayload ? documentPayload.document : grantAgreement as Block[]
    })

    const { editorMode: currentEditorMode } = useBlockNoteStore();

    const [editorMode, setEditorMode] = useState<BlockNoteMode | null>(null);

    const [tempStateStore, setTempStateStore] = useState<Block[]>([]);

    useEffect(() => {
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


    const Header = useMemo(() => {
        if (editorMode === BlockNoteMode.VIEW) {
            if (documentStatus === DocumentStatus.UNSIGNED) {
                return <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                    <Text>Document Is Not Signed</Text>
                </div>
            } else if (documentStatus === DocumentStatus.SIGNED) {
                return <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                    <Text>Document Is Signed!!!</Text>
                </div>
            }
        }

        else if (editorMode === BlockNoteMode.EDIT) {
            return <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                <Text>Make edits and hit publish to get a shareable link and start the signing ceremony</Text>
                <div className="flex space-x-4">
                    <ExportDialog editor={editor} />
                </div>
            </div>
        }

        else if (editorMode === BlockNoteMode.SIMULATION) {
            return <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                <Text>Hit sign to complete simulation</Text>
                <div className="flex space-x-4">
                    <EthSignDialog editor={editor} isSimulationMode />
                </div>
            </div>
        }

        else if (editorMode === BlockNoteMode.SIGNATURE) {
            return <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                <Text>Review the document, fill in all details required, and sign all signature blocks</Text>
                <div className="flex space-x-4">
                    <EthSignDialog editor={editor} documentPayload={documentPayload!} />
                </div>
            </div>
        }

        return <></>
    }, [editorMode, documentStatus]);

    return <>
        { Header }
        <BlockNoteView
            editor={editor}
            editable={editorMode === BlockNoteMode.EDIT}
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
        </BlockNoteView>
    </>
}

export default BNDocumentView;