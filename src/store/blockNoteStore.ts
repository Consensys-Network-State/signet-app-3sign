import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

// Need some way to propogate current state of Blocknote to the Blocknote blocks
// This is a hacky way to accomplish this
// TODO: Can we pass this through the block note view props somehow?
export enum BlockNoteMode {
    EDIT = "EDIT",
    SIGNATURE = "SIGNATURE",
    VIEW = "VIEW",
}

export const useBlockNoteStore = create(
    devtools(
        combine(
            {
                editorMode: BlockNoteMode.EDIT,
            }, // Initial state
            (set) => ({
                setEditorMode: (editorMode: BlockNoteMode) =>
                    set(() => ({ editorMode }), undefined, 'blockNoteStore/updateEditorMode'),
            })
        ),
    )
);
