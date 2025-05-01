import * as React from "react";
import { View } from "react-native";
import { useParams } from 'react-router';
import { Text, Card, Button, Input, InputField } from "@ds3/react";
import { useDocumentStore } from "../store/documentStore";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";

const ActionSideMenu: React.FC = () => {
  const params = useParams();
  const { control } = useForm();
  
  // Get document ID from any of the possible route parameters
  const documentId = params.draftId || params.agreementId || params.documentId;
  
  // Check both documents and drafts in the store
  const currentDocument = useDocumentStore(state => {
    if (!documentId) return null;
    return state.documents.find(doc => doc.id === documentId) || 
           state.drafts.find(draft => draft.id === documentId);
  });

  if (!currentDocument) {
    return null;
  }

  const executionInputs = currentDocument.execution?.inputs || {};
  const states = currentDocument.execution?.states || {};
  const transitions = currentDocument.execution?.transitions || [];

  // Helper function to extract variable references from a string
  const extractVariableRefs = (str: string): string[] => {
    const matches = str.match(/\${variables\.([^}]+)}/g) || [];
    return matches.map(match => match.replace('${variables.', '').replace('}', ''));
  };

  // Find initial state and its params
  const initialState = Object.entries(states)
    .find(([_, state]) => state.isInitial)?.[1];
  
  const initialParams = initialState?.initialParams || {};
  const isInitializing = !currentDocument.execution?.states[currentDocument.execution?.currentState || ''];

  return (
    <View className="flex flex-col gap-8">
      {/* Actions Section */}
      {isInitializing && Object.keys(initialParams).length > 0 && (
        <View className="flex flex-col gap-4">
          <Text className="text-sm font-medium text-neutral-11">Actions</Text>
          <Card className="p-4">
            <View className="flex flex-col gap-2">
              <Text className="font-semibold">Initialize Agreement</Text>
              <Text className="text-sm text-neutral-11">{initialState?.description}</Text>
              
              {Object.entries(initialParams).map(([paramKey, paramValue]) => {
                const variableRefs = extractVariableRefs(paramValue as string);
                return variableRefs.map(variableRef => (
                  <Controller
                    key={variableRef}
                    control={control}
                    name={variableRef}
                    render={({ field }) => (
                      <InputField
                        {...field}
                        variant="underline"
                        placeholder={variableRef}
                        className="w-full"
                      />
                    )}
                  />
                ));
              })}

              <View className="flex flex-row justify-end mt-2">
                <Button variant="soft" color="primary" size="sm">
                  <Button.Text>Initialize</Button.Text>
                </Button>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Next Actions Section */}
      {transitions.length > 0 && (
        <View className="flex flex-col gap-4">
          <Text className="text-sm font-medium text-neutral-11">Next Actions</Text>
          {transitions.map((transition, index) => {
            const input = executionInputs[transition.conditions[0]?.input];
            const toState = states[transition.to];
            
            if (!input || !toState) return null;

            return (
              <Card key={index} className="p-4">
                <View className="flex flex-col gap-2">
                  <Text className="font-semibold">{input.displayName}</Text>
                  <Text className="text-sm text-neutral-11">{input.description}</Text>
                  <Text className="text-xs text-neutral-11">{toState.description}</Text>

                  {/* Input fields for variable references in data */}
                  {Object.entries(input.data || {}).map(([fieldKey, fieldValue]) => {
                    // Handle nested objects in data
                    if (typeof fieldValue === 'object' && fieldValue !== null) {
                      return Object.entries(fieldValue).map(([nestedKey, nestedValue]) => {
                        // Only show inputs for string values that contain variable references
                        if (typeof nestedValue === 'string' && nestedValue.includes('${variables.')) {
                          const variableRefs = extractVariableRefs(nestedValue);
                          return variableRefs.map(variableRef => (
                            <Controller
                              key={`${fieldKey}.${nestedKey}.${variableRef}`}
                              control={control}
                              name={`${transition.conditions[0].input}.${fieldKey}.${nestedKey}.${variableRef}`}
                              render={({ field }) => (
                                <InputField
                                  {...field}
                                  variant="underline"
                                  placeholder={variableRef}
                                  className="w-full"
                                />
                              )}
                            />
                          ));
                        }
                        return null;
                      });
                    }
                    
                    // Handle simple string values
                    if (typeof fieldValue === 'string' && fieldValue.includes('${variables.')) {
                      const variableRefs = extractVariableRefs(fieldValue);
                      return variableRefs.map(variableRef => (
                        <Controller
                          key={`${fieldKey}.${variableRef}`}
                          control={control}
                          name={`${transition.conditions[0].input}.${fieldKey}.${variableRef}`}
                          render={({ field }) => (
                            <InputField
                              {...field}
                              variant="underline"
                              placeholder={variableRef}
                              className="w-full"
                            />
                          )}
                        />
                      ));
                    }
                    return null;
                  })}

                  <View className="flex flex-row justify-end mt-2">
                    <Button variant="soft" color="primary" size="sm">
                      <Button.Text>Execute</Button.Text>
                    </Button>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ActionSideMenu; 