import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Variable {
  id: string;
  blockId: string;
  blockType: string;
  propName: string;
  value: any;
}

interface VariablesState {
  variables: Record<string, Variable>;
  addVariable: (variable: Variable) => void;
  updateVariable: (variable: Variable) => void;
  removeVariable: (id: string) => void;
  clearVariables: () => void;
}

export const useVariablesStore = create<VariablesState>()(
  devtools(
    persist(
      (set) => ({
        variables: {},
        addVariable: (variable) =>
          set(
            (state) => ({
              variables: {
                ...state.variables,
                [variable.id]: variable,
              },
            }),
            false,
            'variablesStore/addVariable'
          ),
        updateVariable: (variable) =>
          set(
            (state) => ({
              variables: {
                ...state.variables,
                [variable.id]: variable,
              },
            }),
            false,
            'variablesStore/updateVariable'
          ),
        removeVariable: (id) =>
          set(
            (state) => {
              const newVariables = { ...state.variables };
              delete newVariables[id];
              return { variables: newVariables };
            },
            false,
            'variablesStore/removeVariable'
          ),
        clearVariables: () =>
          set(
            { variables: {} },
            false,
            'variablesStore/clearVariables'
          ),
      }),
      {
        name: 'variables-storage', // name of the item in localStorage
        version: 1, // version number for migrations
      }
    )
  )
); 