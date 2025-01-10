import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

export enum BlockEditorMode {
    EDITOR = "EDITOR",
    SIMULATOR = "SIMULATOR",
    LOG = "LOG"
}

export const useEditorStore = create(
    devtools(
        combine(
            {
                editorMode: BlockEditorMode.EDITOR,
            }, // Initial state
            (set) => ({
                setEditorMode: (editorMode: BlockEditorMode) =>
                    set(() => ({ editorMode }), undefined, 'editorStore/updateEditorMode'),
            })
        ),
    )
);
