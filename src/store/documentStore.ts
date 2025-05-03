import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';

export interface VariableValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
};

export interface DocumentVariable {
  id?: string;
  type: 'string' | 'number' | 'boolean' | 'address' | 'dateTime';
  name: string;
  description?: string;
  value?: string;
  validation?: VariableValidation
}

export interface DocumentMetadata {
  id: string;
  templateId: string;
  version: string;
  createdAt: string;
  name: string;
  author: string;
  description: string;
}

export interface DocumentState {
  name: string;
  description: string;
  isInitial?: boolean;
  initialParams?: Record<string, string>;
}

export interface InputDataField {
  type?: string;
  validation?: VariableValidation;
}

export interface DocumentInput {
  type: string;
  schema?: string;
  displayName: string;
  description: string;
  data: Record<string, string | InputDataField>;
  issuer: string;
}

export interface Transition {
  from: string;
  to: string;
  conditions: {
    type: string;
    input: string;
  }[];
}

export interface DocumentExecution {
  states: Record<string, DocumentState>;
  inputs: Record<string, DocumentInput>;
  transitions: Transition[];
}

export interface Document {
  id?: string;
  metadata: DocumentMetadata;
  variables: Record<string, DocumentVariable>;
  content: {
    type: 'md' | 'mdast';
    data: string | any;
  };
  execution: DocumentExecution;
}

export interface Agreement {
  id: string;
  document: Document;
  contributors: `0x${string}`[];
  state: {
    IsComplete: boolean;
    State: {
      description: string;
      id: string;
      name: string;
      isInitial: boolean;
    };
    ReceievedInputs: {
      id: string;
      name: string;
      value: any;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

interface DocumentSlice {
  agreements: Agreement[];
  drafts: Document[];
  currentDocumentId: string | null;
  currentDraftId: string | null;
}

const emptyExecution: DocumentExecution = {
  states: {},
  inputs: {},
  transitions: [],
};

export const useDocumentStore = create(
  persist(
    devtools(
      combine(
        {
          agreements: [],
          drafts: [],
          currentDocumentId: null,
          currentDraftId: null,
        } as DocumentSlice,
        (set, get) => ({
          getAgreement: (id: string) => {
            return get().agreements.find(agreement => agreement.id === id);
          },
          createDraft: (title: string, content: string, variables: Record<string, DocumentVariable> = {}, execution: DocumentExecution = emptyExecution) => {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            const draft: Document = {
              id,
              metadata: {
                id: `did:example:${id}`,
                templateId: 'draft',
                version: '1.0.0',
                createdAt: now,
                name: title,
                author: '',
                description: 'Draft document',
              },
              variables,
              content: {
                type: 'md',
                data: content,
              },
              execution,
            };
            set(
              (state) => ({
                drafts: [...state.drafts, draft],
                currentDraftId: id,
              }),
              undefined,
              'documentStore/createDraft'
            );
            return id;
          },
          updateDraft: (id: string, content: string, variables?: Record<string, DocumentVariable>) => {
            set(
              (state) => ({
                drafts: state.drafts.map(draft =>
                  draft.id === id
                    ? {
                        ...draft,
                        content: { type: 'md', data: content },
                        variables: variables || draft.variables,
                        updatedAt: new Date().toISOString()
                      }
                    : draft
                ),
              }),
              undefined,
              'documentStore/updateDraft'
            );
          },
          updateDraftTitle: (id: string, title: string) => {
            set(
              (state) => ({
                drafts: state.drafts.map(draft =>
                  draft.id === id
                    ? { ...draft, metadata: { ...draft.metadata, name: title }, updatedAt: new Date().toISOString() }
                    : draft
                ),
              }),
              undefined,
              'documentStore/updateDraftTitle'
            );
          },
          deleteDraft: (id: string) => {
            set(
              (state) => ({
                drafts: state.drafts.filter(draft => draft.id !== id),
                currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
              }),
              undefined,
              'documentStore/deleteDraft'
            );
          },
          getDraft: (id: string) => {
            return get().drafts.find(draft => draft.id === id);
          },
          setCurrentDraft: (id: string | null) => {
            set(
              () => ({ currentDraftId: id }),
              undefined,
              'documentStore/setCurrentDraft'
            );
          },
          getCurrentDraft: () => {
            const state = get();
            return state.currentDraftId
              ? state.drafts.find(d => d.id === state.currentDraftId)
              : null;
          },
          updateAgreement: (id: string, agreement: Agreement) => {
            set(
              (state) => ({
                agreements: state.agreements.map(a => a.id === id ? agreement : a),
              }),
              undefined,
              'documentStore/updateAgreement'
            );
          },
          addAgreements: (agreements: Agreement[]) => {
            set(
              (state) => {
                // Filter out documents that already exist in the store
                const existingIds = new Set(state.agreements.map(agreement => agreement.id));
                const newAgreements = agreements.filter(agreement => !existingIds.has(agreement.id));
                
                return {
                  agreements: [...state.agreements, ...newAgreements],
                };
              },
              undefined,
              'documentStore/addAgreements'
            );

            return agreements.map(agreement => agreement.id);
          },
        })
      ),
    ),
    {
      name: 'document-state',
    }
  )
); 