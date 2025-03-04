import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { isAddress } from 'viem';

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
            (state) => {
              const newVariables = {
                ...state.variables,
                [variable.id]: variable,
              };

              // If the value is a valid Ethereum address, create a generic wallet address variable
              if (typeof variable.value === 'string' && isAddress(variable.value)) {
                // Check if this wallet address already exists in global variables
                const existingWallet = Object.values(state.variables).find(
                  v => v.blockId === 'global' && v.value === variable.value
                );

                if (!existingWallet) {
                  // Find the highest existing wallet number
                  const walletNumbers = Object.values(state.variables)
                    .filter(v => v.blockId === 'global' && v.propName.startsWith('wallet'))
                    .map(v => {
                      const num = parseInt(v.propName.replace('wallet', ''));
                      return isNaN(num) ? 0 : num;
                    });

                  const nextNumber = walletNumbers.length > 0 
                    ? Math.max(...walletNumbers) + 1 
                    : 1;

                  const genericId = `walletAddress-${variable.value}`;
                  newVariables[genericId] = {
                    id: genericId,
                    blockId: 'global',
                    blockType: 'walletAddress',
                    propName: `wallet${nextNumber}`,
                    value: variable.value,
                  };
                }
              }

              return { variables: newVariables };
            },
            false,
            'variablesStore/addVariable'
          ),
        updateVariable: (variable) =>
          set(
            (state) => {
              const newVariables = {
                ...state.variables,
                [variable.id]: variable,
              };

              // Also update or create generic wallet address variable if applicable
              if (typeof variable.value === 'string' && isAddress(variable.value)) {
                // Check if this wallet address already exists in global variables
                const existingWallet = Object.values(state.variables).find(
                  v => v.blockId === 'global' && v.value === variable.value
                );

                if (!existingWallet) {
                  // Find the highest existing wallet number
                  const walletNumbers = Object.values(state.variables)
                    .filter(v => v.blockId === 'global' && v.propName.startsWith('wallet'))
                    .map(v => {
                      const num = parseInt(v.propName.replace('wallet', ''));
                      return isNaN(num) ? 0 : num;
                    });

                  const nextNumber = walletNumbers.length > 0 
                    ? Math.max(...walletNumbers) + 1 
                    : 1;

                  const genericId = `walletAddress-${variable.value}`;
                  newVariables[genericId] = {
                    id: genericId,
                    blockId: 'global',
                    blockType: 'walletAddress',
                    propName: `wallet${nextNumber}`,
                    value: variable.value,
                  };
                }
              }

              return { variables: newVariables };
            },
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
        name: 'variables-storage',
        version: 1,
      }
    )
  )
); 