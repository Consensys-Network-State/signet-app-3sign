import { Variable } from '../store/variablesStore';

// Convert a value to a variable reference if it exists in the store
export const toVariableReference = (
  value: any, 
  variables: Record<string, Variable>
): string | null => {
  // Find if this value exists in any global variable
  const variable = Object.values(variables).find(
    v => v.blockId === 'global' && v.value === value
  );
  
  return variable ? `\${${variable.propName}}` : null;
};

// Resolve a potential variable reference to its actual value
export const resolveVariableReference = (
  reference: string,
  variables: Record<string, Variable>
): any => {
  const match = reference.match(/^\${(.*)}$/);
  if (!match) return reference;

  const varName = match[1];
  const variable = Object.values(variables).find(
    v => v.blockId === 'global' && v.propName === varName
  );

  return variable ? variable.value : reference;
};

// Check if a string is a variable reference
export const isVariableReference = (value: string): boolean => {
  return /^\${.*}$/.test(value);
}; 