// TODO: Some functions here may become part of the SDK
import { Agreement, Document } from "../store/documentStore";

export const getInitialState = (document: Document) => {
  const stateKeys = Object.keys(document.execution.states);
  const toStates = new Set(
    document.execution.transitions.map((transition) => transition.to)
  );
  const initialStateKey = stateKeys.find((key) => !toStates.has(key));
  return initialStateKey ? document.execution.states[initialStateKey] : undefined;
}

export const getInitialStateParams = (document: Document | null) => {
  if (!document) return {};
  const initialParams = document.execution.initialize?.data;
  if (!initialParams) return {};
  
  return Object.entries(initialParams).reduce((acc, [key, value]) => {
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
  const match = contractReference.match(/\$\{contracts\.([^.}]+)}/);
  if (agreement.document.contracts && match && match[1]) {
    return agreement.document.contracts[match[1]];
  }
  return null;
}

export const getNextStates = (agreement: Agreement) => {
  const currentState = getCurrentState(agreement);
  return agreement.document.execution.transitions
    .filter((transition) => transition.from === currentState!.id)
    .map((transition) => {
      const trans = {
        to: agreement.document.execution.states[transition.to],
        conditions: transition.conditions.map((condition) => {
          const conditionInput = agreement.document.execution.inputs[condition.input];
          if (conditionInput.type === 'VerifiedCredentialEIP712') {
            const issuer = getVariableValue(agreement, conditionInput.issuer);
            return {
              type: condition.type,
              input: { 
                ...conditionInput,
                id: condition.input,
                issuer,
                data: Object.entries(conditionInput.data).reduce((acc, [key, value]) => {
                  if (typeof value === 'string') {
                    const match = value.match(/\$\{variables\.([^}]+)\}/);
                    if (match && match[1]) {
                      const variable = agreement.document.variables[match[1]];
                      if (
                        variable &&
                        variable.txMetadata &&
                        variable.txMetadata.transactionType === 'contractCall' &&
                        variable.txMetadata.contractReference
                      ) {
                        acc[key] = {
                          ...variable,
                          txMetadata: {
                            ...variable.txMetadata,
                            contractReference: getContractReference(
                              agreement,
                              variable.txMetadata.contractReference
                            ),
                          },
                        };
                      } else {
                        acc[key] = variable;
                      }
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
          }
        }
      )
    }
    return trans;
  });
}