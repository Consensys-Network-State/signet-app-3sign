import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import {Block} from "../blocks/BlockNoteSchema.tsx";

interface EditSlice {
  editState: Block[] | null;
}

export const useEditStore = create(
  persist(
    devtools(
      combine(
        {
          editState: null,
        } as EditSlice, // Initial state
        (set) => ({
          setEditState: (editState: Block[]) =>
            set(() => ({ editState }), undefined, 'editStore/setEditState'),
        })
      ),
    ),
    {
      name: 'edit-state', // this is the only required option - it sets the localStorage key
    }
  )
);
