import { Variable } from '../store/variablesStore';

// Convert a value to a variable reference
export const toVariableReference = (name: string): string => {
  return `\${${name}}`;
};

// Check if a string is a variable reference
export const isVariableReference = (value: string): boolean => {
  return /^\${.*}$/.test(value);
};

// Extract variable name from reference
export const getVariableNameFromReference = (reference: string): string | null => {
  const match = reference.match(/^\${(.*)}$/);
  return match ? match[1] : null;
};

// Resolve a variable reference to its value
export const resolveVariableReference = (
  reference: string,
  variables: Record<string, Variable>
): any => {
  const varName = getVariableNameFromReference(reference);
  if (!varName) return reference;
  
  return variables[varName]?.value ?? reference;
}; 