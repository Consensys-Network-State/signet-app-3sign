import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type VariableType = 'address' | 'text' | 'date' | 'number' | 'boolean';

export interface Variable {
  name: string;
  type: VariableType;
  value: any;
}

interface VariablesState {
  variables: Record<string, Variable>;
  addVariable: (name: string, type: VariableType, value: any) => void;
  updateVariable: (name: string, value: any) => void;
  removeVariable: (name: string) => void;
  clearVariables: () => void;
}

export const useVariablesStore = create<VariablesState>()(
  devtools(
    persist(
      (set) => ({
        variables: {},
        addVariable: (name, type, value) =>
          set(
            (state) => ({
              variables: {
                ...state.variables,
                [name]: { name, type, value }
              }
            }),
            false,
            'variablesStore/addVariable'
          ),
        updateVariable: (name, value) =>
          set(
            (state) => ({
              variables: {
                ...state.variables,
                [name]: { ...state.variables[name], value }
              }
            }),
            false,
            'variablesStore/updateVariable'
          ),
        removeVariable: (name) =>
          set(
            (state) => {
              const newVariables = { ...state.variables };
              delete newVariables[name];
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
        name: 'variables-storage',
        version: 1,
      }
    )
  )
); 