import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { Block } from "../blocks/BlockNoteSchema.tsx";

export interface Draft {
  id: string;
  title: string;
  content: Block[];
  createdAt: string;
  updatedAt: string;
}

interface EditSlice {
  drafts: Draft[];
  currentDraftId: string | null;
}

export const useEditStore = create(
  persist(
    devtools(
      combine(
        {
          drafts: [],
          currentDraftId: null,
        } as EditSlice, // Initial state
        (set, get) => ({
          createDraft: (title: string, content: Block[]) => {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            const draft: Draft = {
              id,
              title,
              content,
              createdAt: now,
              updatedAt: now,
            };
            set(
              (state) => ({ 
                drafts: [...state.drafts, draft],
                currentDraftId: id 
              }),
              undefined,
              'editStore/createDraft'
            );
            return id;
          },
          updateDraft: (id: string, content: Block[]) => {
            set(
              (state) => ({
                drafts: state.drafts.map(draft =>
                  draft.id === id
                    ? { ...draft, content, updatedAt: new Date().toISOString() }
                    : draft
                )
              }),
              undefined,
              'editStore/updateDraft'
            );
          },
          updateDraftTitle: (id: string, title: string) => {
            set(
              (state) => ({
                drafts: state.drafts.map(draft =>
                  draft.id === id
                    ? { ...draft, title, updatedAt: new Date().toISOString() }
                    : draft
                )
              }),
              undefined,
              'editStore/updateDraftTitle'
            );
          },
          deleteDraft: (id: string) => {
            set(
              (state) => ({
                drafts: state.drafts.filter(draft => draft.id !== id),
                currentDraftId: state.currentDraftId === id ? null : state.currentDraftId
              }),
              undefined,
              'editStore/deleteDraft'
            );
          },
          setCurrentDraft: (id: string | null) => {
            set(
              () => ({ currentDraftId: id }),
              undefined,
              'editStore/setCurrentDraft'
            );
          },
          getCurrentDraft: () => {
            const state = get();
            return state.currentDraftId 
              ? state.drafts.find(d => d.id === state.currentDraftId) 
              : null;
          }
        })
      ),
    ),
    {
      name: 'edit-state',
    }
  )
);
