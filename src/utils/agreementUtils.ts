// TODO: Some functions here may become part of the SDK
import { Agreement, Document, DocumentState } from "../store/documentStore";

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

export const getCurrentState = (agreement: Agreement) => {
  return agreement.state.State;
}

export const getVariableValue = (agreement: Agreement, variableReference: string) => {
  const match = variableReference.match(/\$\{variables\.([^.}]+)\.value\}/);
  if (match && match[1]) {
    return agreement.state.Variables[match[1]].value;
  }
}

export const getContractReference = (agreement: Agreement, contractReference: string) => {
  if (agreement.document.contracts) {
    return agreement.document.contracts.find((contract) => contract.id === contractReference);
  }
  return null;
}

export const getNextStates = (agreement: Agreement) => {
  const currentState = getCurrentState(agreement);
  return agreement.document.execution.transitions
    .filter((transition) => transition.from === currentState!.id)
    .map((transition) => ({
        to: agreement.document.execution.states[transition.to],
        conditions: transition.conditions.map((condition) => {
          const conditionInput = agreement.document.execution.inputs[condition.input];
          if (conditionInput.type === 'VerifiedCredentialEIP712') {
            return {
              type: condition.type,
              input: { 
                ...conditionInput,
                id: condition.input,
                issuer: getVariableValue(agreement, conditionInput.issuer),
                data: Object.entries(conditionInput.data).reduce((acc, [key, value]) => {
                  if (typeof value === 'string') {
                    const match = value.match(/\$\{variables\.([^}]+)\}/);
                    if (match && match[1]) {
                      acc[key] = agreement.document.variables[match[1]];
                    } else {
                      acc[key] = value;
                    }
                  } else {
                    acc[key] = value;
                  }
                  return acc;
                }, {} as Record<string, any>)
              }
            }
          } else if (conditionInput.type === 'EVMTransaction') {
            return {
              type: condition.type,
              input: {
                ...conditionInput,
                signer: getVariableValue(agreement, conditionInput.signer),
                txMetadata: {
                  ...conditionInput.txMetadata,
                  ...(conditionInput.txMetadata.transactionType === 'contractCall' && {
                    contractReference: getContractReference(agreement, conditionInput.txMetadata.contractReference),
                  }),
                }
              }
            }
          }
        }
      )
    }));
}