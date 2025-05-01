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

  // Helper function to extract variable references from a string
  const extractVariableRefs = (str: string): string[] => {
    const matches = str.match(/\${variables\.([^}]+)}/g) || [];
    return matches.map(match => match.replace('${variables.', '').replace('}', ''));
  };

  return (
    <View className="flex flex-col gap-4">
      {Object.entries(executionInputs).map(([key, input]) => (
        <Card key={key} className="p-4">
          <View className="flex flex-col gap-2">
            <Text className="font-semibold">{input.displayName}</Text>
            <Text className="text-sm text-neutral-11">{input.description}</Text>
            <View className="flex flex-row items-center gap-2">
              <Text className="text-xs text-neutral-11">Type:</Text>
              <Text className="text-xs">{input.type}</Text>
            </View>
            
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
                        name={`${key}.${fieldKey}.${nestedKey}.${variableRef}`}
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
                    name={`${fieldKey}.${variableRef}`}
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
      ))}
    </View>
  );
};

export default ActionSideMenu; 