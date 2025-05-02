import * as React from "react";
import { View } from "react-native";
import { useNavigate, useParams } from 'react-router';
import { Text, Card, Button, Input, InputField } from "@ds3/react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@ds3/react";
import { useDocumentStore } from "../store/documentStore";
import { Controller } from "react-hook-form";
import { isAddress } from 'viem';
import AddressCard from "../web3/AddressCard";
import truncateEthAddress from "truncate-eth-address";
import { DraftFormContext } from './markdown/Draft';
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Document } from "../store/documentStore";
import { createAgreementInitVC } from "../utils/veramoUtils";
import { postAgreement } from "../api";
import { getInitialState, getInitialStateParams } from "../utils/agreementUtils";

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
  const [selectedVC, setSelectedVC] = React.useState<VerifiableCredential | null>(null);
  const form = React.useContext(DraftFormContext);
  const { address } = useAccount();
  const { updateDraft, deleteDraft, getDraft } = useDocumentStore();
  const navigate = useNavigate();

  // Get document ID from any of the possible route parameters
  const documentId = params.draftId || params.agreementId || params.documentId;
  
  // Check both documents and drafts in the store
  const currentDocument: Document | null = useDocumentStore(state => {
    if (params.draftId) return state.drafts.find(draft => draft.id === params.draftId) || null;
    else if (params.agreementId) return state.agreements.find(agreement => agreement.id === params.agreementId)?.document || null;
    else return null;
  });


  // Get form methods
  
  // // Get execution data from the document
  // const executionInputs = currentDocument.execution?.inputs || {};
  // const states = currentDocument.execution?.states || {};
  // const transitions = TEST_TRANSITIONS;
  
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

  // Get cached form values
  const getCachedValues = React.useCallback(() => {
    if (!documentId) return {};
    const cached = localStorage.getItem(`draft_${documentId}_values`);
    return cached ? JSON.parse(cached) : {};
  }, [documentId]);

  // Helper function to check if a transition's conditions are met
  const isTransitionEnabled = React.useCallback((transition: Transition) => {
    const input = getInputDetails(transition.conditions[0]?.input);
    if (!input) return false;

    // Check if all required variables have values from cache
    const variableRefs = Object.values(input.data).flatMap(extractVariableRefs);
    const cachedValues = getCachedValues();
    return variableRefs.every(ref => cachedValues[ref]);
  }, [getCachedValues]);

  // Handle transition execution
  const onExecuteTransition = React.useCallback(async (values: Record<string, string>, transition: Transition) => {
    const input = getInputDetails(transition.conditions[0]?.input);
    if (!input) return;

    // TODO: Execute the transition
    console.log('Executing transition:', {
      transition,
      input,
      values
    });
  }, []);

  const executionInputs = currentDocument?.execution?.inputs || {};
  const states = currentDocument?.execution?.states || {};
  const transitions = currentDocument?.execution?.transitions || [];
  
  // Find initial state and its params  
  const initialParams = getInitialStateParams(currentDocument);

  // Create mutation for publishing agreement
  const publishMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      if (!currentDocument || !address) throw new Error("Draft or address not available");
      const initValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => key in initialParams).map(([key, value]) => [initialParams[key], value])
      );
      const vc = await createAgreementInitVC(address as `0x${string}`, currentDocument, initValues);
      return postAgreement(vc);
    },
    onSuccess: (data) => {
      const newAgreementId = data.data.id;
      console.log({
        title: "Agreement Published",
        description: "Your agreement has been successfully published",
        variant: "success",
      });
      localStorage.removeItem(`draft_${params.draftId}_values`);
      deleteDraft(params.draftId!);
      navigate(`/agreements/${newAgreementId}`);
    },
    onError: (error) => {
      console.log({
        title: "Publication Failed",
        description: error.message || "Failed to publish agreement",
        variant: "error",
      });
    }
  });

  const onPublish = React.useCallback((values: Record<string, string>) => {
    // TODO: Use Values from Form validation, right now validation is validating the whole form which shouldn't be the case
    publishMutation.mutate(getCachedValues());
  }, [publishMutation]);


  console.log(currentDocument, !!form);
  if (!currentDocument || !form) {
    return null;
  }

  const { control, formState: { errors }, handleSubmit } = form;

  return (
    <View className="flex flex-col gap-4">
      <Text className="text-sm font-medium text-neutral-11">Actions</Text>

      {/* Initial Action Section */}
      {params.draftId && Object.keys(initialParams).length > 0 && (
        <Card className="p-4">
          <View className="flex flex-col gap-2">
            <Text className="font-semibold">Initialize Agreement</Text>
            <Text className="text-sm text-neutral-11">{"Initialize the agreement with the following parameters"}</Text>
            
            {Object.keys(initialParams).map(paramKey => 
              <Controller
                key={paramKey}
                control={control}
                name={paramKey}
                render={({ field: { onChange, value, onBlur } }) => (
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    variant="underline"
                    placeholder={paramKey}
                    error={errors?.[paramKey]?.message?.toString()}
                    className="w-full"
                  />
                )}
              />
            )}

            <View className="flex flex-row justify-end mt-2">
              <Button 
                variant="soft" 
                color="primary" 
                size="sm"
                onPress={onPublish} // TODO: wrap onPublish with dynamic validation function that passes the correct values downstream
                disabled={!Object.keys(initialParams).every(ref => getCachedValues()[ref])}
              >
                <Button.Text>Initialize</Button.Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Available Transitions Section */}
      {transitions.length > 0 && transitions.map((transition, index) => {
        const input = getInputDetails(transition.conditions[0]?.input);
        if (!input) return null;
        return (
          <Card key={index} className="p-4">
            <View className="flex flex-col gap-2">
              <Text className="font-semibold">{input.displayName}</Text>
              <Text className="text-sm text-neutral-11">{input.description}</Text>

              {/* Input fields for variable references in data */}
              {Object.entries(input.data).map(([fieldKey, fieldValue]) => {
                const variableRefs = extractVariableRefs(fieldValue);
                return variableRefs.map(variableRef => (
                  <Controller
                    key={`${fieldKey}.${variableRef}`}
                    control={control}
                    name={variableRef}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        variant="underline"
                        placeholder={variableRef}
                        error={errors?.[variableRef]?.message?.toString()}
                        className="w-full"
                      />
                    )}
                  />
                ));
              })}

              <View className="flex flex-row justify-end mt-2">
                <Button 
                  variant="soft" 
                  color="primary" 
                  size="sm"
                  onPress={handleSubmit((values) => onExecuteTransition(values, transition))}
                  disabled={!isTransitionEnabled(transition)}
                >
                  <Button.Text>Execute</Button.Text>
                </Button>
              </View>
            </View>
          </Card>
        );
      })}

      {/* Completed Actions Section */}
      {TEST_COMPLETED_VCS.length > 0 && (
        <>
          <Text className="text-sm font-medium text-neutral-11 mt-4">Completed Actions</Text>
          {TEST_COMPLETED_VCS.map((vc, index) => {
            const input = getInputDetails(vc.credentialSubject.id);
            if (!input) return null;

            // Extract the Ethereum address from the DID
            const address = vc.issuer.id.split(':').pop() || '';
            const isValidAddress = isAddress(address);
            const truncatedAddress = isValidAddress ? truncateEthAddress(address) : address;

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
                  {Object.entries(vc.credentialSubject.values).map(([key, value]) => {
                    // Check if the value looks like an Ethereum address
                    const isAddressValue = typeof value === 'string' && isAddress(value);
                    
                    return (
                      <View key={key} className="flex flex-col gap-1">
                        <Text className="text-sm text-neutral-11">{key}</Text>
                        {isAddressValue ? (
                          <AddressCard 
                            address={value as `0x${string}`} 
                            className="h-8" 
                            avatarClassName="w-5 h-5"
                          />
                        ) : (
                          <Text className="text-sm">{value}</Text>
                        )}
                      </View>
                    );
                  })}

                  {/* Show who signed it */}
                  <View className="mt-2">
                    <Text className="text-xs text-neutral-11 mb-1">Signed by</Text>
                    {isValidAddress && (
                      <AddressCard 
                        address={address as `0x${string}`} 
                        className="h-8"
                        avatarClassName="w-5 h-5"
                      />
                    )}
                  </View>

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