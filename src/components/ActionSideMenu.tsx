import * as React from "react";
import { View } from "react-native";
import { useParams } from 'react-router';
import { Text, Card, Button, Input, InputField } from "@ds3/react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@ds3/react";
import { useDocumentStore } from "../store/documentStore";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";

// TODO: Remove these test transitions once backend integration is complete
const TEST_TRANSITIONS = [
  {
    "from": "PENDING_PARTY_A_SIGNATURE",
    "to": "PENDING_PARTY_B_SIGNATURE",
    "conditions": [
      {
        "type": "isValid",
        "input": "partyAData"
      }
    ]
  },
  {
    "from": "PENDING_PARTY_B_SIGNATURE",
    "to": "PENDING_ACCEPTANCE",
    "conditions": [
      {
        "type": "isValid",
        "input": "partyBData"
      }
    ]
  }
] as const;

const TEST_INPUTS = {
  "partyAData": {
    "type": "VerifiedCredentialEIP712",
    "schema": "verified-credential-eip712.schema.json",
    "displayName": "Party A Signature",
    "description": "EIP712 signature from Party A proposing the MOU terms",
    "data": {
      "partyAName": "${variables.partyAName}",
      "partyBEthAddress": "${variables.partyBEthAddress}"
    },
    "issuer": "${variables.partyAEthAddress.value}"
  },
  "partyBData": {
    "type": "VerifiedCredentialEIP712",
    "schema": "verified-credential-eip712.schema.json",
    "displayName": "Party B Signature",
    "description": "EIP712 signature from Party B accepting the MOU terms",
    "data": {
      "partyBName": "${variables.partyBName}"
    },
    "issuer": "${variables.partyBEthAddress.value}"
  }
} as const;

// Test completed VCs
const TEST_COMPLETED_VCS = [
  {
    "issuer": {
      "id": "did:pkh:eip155:1:0x67fD5A5ec681b1208308813a2B3A0DD431Be7278"
    },
    "credentialSubject": {
      "id": "partyAData",
      "type": "signedFields",
      "values": {
        "partyAName": "Damian",
        "partyBEthAddress": "0xBe32388C134a952cdBCc5673E93d46FfD8b85065"
      }
    },
    "type": [
      "VerifiableCredential",
      "AgreementInputCredential"
    ],
    "issuanceDate": "2025-04-28T22:33:55.609Z"
  }
] as const;

interface Transition {
  from: string;
  to: string;
  conditions: Array<{
    type: string;
    input: string;
  }>;
}

interface DocumentInput {
  type: string;
  schema: string;
  displayName: string;
  description: string;
  data: Record<string, any>;
  issuer: string;
}

interface VerifiableCredential {
  issuer: {
    id: string;
  };
  credentialSubject: {
    id: string;
    type: string;
    values: Record<string, string>;
  };
  type: readonly string[];
  issuanceDate: string;
}

const VCDetailsModal: React.FC<{
  vc: VerifiableCredential;
  isOpen: boolean;
  onClose: () => void;
}> = ({ vc, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifiable Credential Details</DialogTitle>
          <DialogDescription>
            Complete details of the signed credential
          </DialogDescription>
        </DialogHeader>

        <View className="mt-4">
          <View className="bg-neutral-2 p-4 rounded-md">
            <Text className="font-mono text-sm whitespace-pre-wrap">
              {JSON.stringify(vc, null, 2)}
            </Text>
          </View>
        </View>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="soft" color="neutral">
              <Button.Text>Close</Button.Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionSideMenu: React.FC = () => {
  const params = useParams();
  const { control } = useForm();
  const [selectedVC, setSelectedVC] = React.useState<VerifiableCredential | null>(null);
  
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

  // Get execution data from the document
  const executionInputs = currentDocument.execution?.inputs || {};
  const states = currentDocument.execution?.states || {};
  // Using test transitions for now
  const transitions = [];

  // Find initial state
  const initialState = Object.entries(states)
    .find(([_, state]) => state && typeof state === 'object' && 'isInitial' in state && state.isInitial)?.[1];
  
  const initialParams = initialState?.initialParams || {};
  // Temporarily force isInitializing to false to test transitions
  const isInitializing = false;

  // Helper function to get input details from template
  const getInputDetails = (inputId: string): DocumentInput | undefined => {
    // Use test inputs for now
    return TEST_INPUTS[inputId as keyof typeof TEST_INPUTS] || executionInputs[inputId];
  };

  // Helper function to extract variable references from a string
  const extractVariableRefs = (str: string): string[] => {
    if (typeof str !== 'string') return [];
    const matches = str.match(/\${variables\.([^}]+)}/g) || [];
    return matches.map(match => match.replace('${variables.', '').replace('}', ''));
  };

  console.log('Rendering transitions:', transitions); // Debug log

  return (
    <View className="flex flex-col gap-4">
      <Text className="text-sm font-medium text-neutral-11">Actions</Text>

      {/* Initial Action Section */}
      {initialState && Object.keys(initialParams).length > 0 && (
        <Card className="p-4">
          <View className="flex flex-col gap-2">
            <Text className="font-semibold">Initialize Agreement</Text>
            {initialState.description && (
              <Text className="text-sm text-neutral-11">{initialState.description}</Text>
            )}
            
            {Object.entries(initialParams).map(([paramKey, paramValue]) => {
              const variableRefs = extractVariableRefs(paramValue);
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
      )}

      {/* Available Transitions Section */}
      {transitions.length > 0 && transitions.map((transition, index) => {
        console.log('Processing transition:', transition);
        const input = getInputDetails(transition.conditions[0]?.input);
        console.log('Found input:', input);
        const toState = states[transition.to];
        
        if (!input || !toState) {
          console.log('Missing input or toState:', { input, toState });
          return null;
        }

        return (
          <Card key={index} className="p-4">
            <View className="flex flex-col gap-2">
              <Text className="font-semibold">{input.displayName}</Text>
              <Text className="text-sm text-neutral-11">{input.description}</Text>
              {toState.description && (
                <Text className="text-xs text-neutral-11">{toState.description}</Text>
              )}

              {/* Input fields for variable references in data */}
              {Object.entries(input.data || {}).map(([fieldKey, fieldValue]) => {
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
              })}

              <View className="flex flex-row justify-end mt-2">
                <Button variant="soft" color="primary" size="sm">
                  <Button.Text>Execute</Button.Text>
                </Button>
              </View>
            </View>
          </Card>
        )}
      )}

      {/* Completed Actions Section */}
      {TEST_COMPLETED_VCS.length > 0 && (
        <>
          <Text className="text-sm font-medium text-neutral-11 mt-4">Completed Actions</Text>
          {TEST_COMPLETED_VCS.map((vc, index) => {
            const input = getInputDetails(vc.credentialSubject.id);
            if (!input) return null;

            return (
              <Card key={index} className="p-4 bg-neutral-3">
                <View className="flex flex-col gap-2">
                  <View className="flex flex-row items-center justify-between">
                    <Text className="font-semibold">{input.displayName}</Text>
                    <Text className="text-xs text-neutral-11">
                      {new Date(vc.issuanceDate).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {/* Show the actual values that were signed */}
                  {Object.entries(vc.credentialSubject.values).map(([key, value]) => (
                    <View key={key} className="flex flex-col gap-1">
                      <Text className="text-sm text-neutral-11">{key}</Text>
                      <Text className="text-sm">{value}</Text>
                    </View>
                  ))}

                  {/* Show who signed it */}
                  <Text className="text-xs text-neutral-11 mt-2">
                    Signed by {vc.issuer.id}
                  </Text>

                  {/* View Details Button */}
                  <View className="flex flex-row justify-end mt-2">
                    <Button 
                      variant="ghost" 
                      color="neutral" 
                      size="sm"
                      onPress={() => setSelectedVC(vc)}
                    >
                      <Button.Text>View Details</Button.Text>
                    </Button>
                  </View>
                </View>
              </Card>
            );
          })}
        </>
      )}

      {/* VC Details Modal */}
      <VCDetailsModal
        vc={selectedVC!}
        isOpen={selectedVC !== null}
        onClose={() => setSelectedVC(null)}
      />
    </View>
  );
};

export default ActionSideMenu; 