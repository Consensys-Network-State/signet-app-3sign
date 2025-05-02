// TODO: Some functions here may become part of the SDK
import { Document, DocumentState } from "../store/documentStore";

export const getInitialState = (document: Document) => 
    Object.values(document.execution.states).find((stateObj: DocumentState) => stateObj.isInitial);

export const getInitialStateParams = (document: Document | null) => {
  if (!document) return {};
  const initialState = getInitialState(document);
  if (!initialState?.initialParams) return {};
  
  return Object.entries(initialState.initialParams).reduce((acc, [key, value]) => {
    const match = typeof value === 'string' && value.match(/\$\{variables\.([^}]+)\}/);
    if (match && match[1]) {
      acc[match[1]] = key;
    }
    return acc;
  }, {} as Record<string, string>);
}
