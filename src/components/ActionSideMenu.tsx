import * as React from "react";
import { View } from "react-native";
import { useNavigate, useParams } from 'react-router';
import { Text, Card, Button, Input, InputField } from "@ds3/react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@ds3/react";
import { useDocumentStore } from "../store/documentStore";
import { useEditStore } from "../store/editorStore";
import { Controller } from "react-hook-form";
import { isAddress } from 'viem';
import AddressCard from "../web3/AddressCard";
import truncateEthAddress from "truncate-eth-address";
import { FormContext } from '../contexts/FormContext';
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Document } from "../store/documentStore";
import { createAgreementInitVC, createAgreementInputVC } from "../utils/veramoUtils";
import { postAgreement, postAgreementInput } from "../api/index";
import { getCurrentState, getInitialState, getInitialStateParams, getNextStates } from "../utils/agreementUtils";
import { formCache } from "../utils/formCache";
import { handleTitleChange as handleTitleChangeUtil } from '../utils/documentUtils';

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
  const form = React.useContext(FormContext);
  const { address } = useAccount();
  const { updateDraft, deleteDraft, getDraft } = useDocumentStore();
  const { getCurrentDraft: getCurrentBlockNoteDraft, updateDraftTitle: updateBlockNoteDraftTitle } = useEditStore();
  const { getCurrentDraft: getCurrentMarkdownDraft, updateDraftTitle: updateMarkdownDraftTitle } = useDocumentStore();
  const navigate = useNavigate();
  
  const blockNoteDraft = getCurrentBlockNoteDraft();
  const markdownDraft = getCurrentMarkdownDraft();
  
  const [title, setTitle] = React.useState(
    blockNoteDraft?.title || 
    markdownDraft?.metadata?.name || 
    'Untitled Agreement'
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    handleTitleChangeUtil({
      title: newTitle,
      blockNoteDraft,
      markdownDraft,
      updateBlockNoteDraftTitle,
      updateMarkdownDraftTitle,
    });
  };

  // Get document ID from any of the possible route parameters
  const documentId = params.draftId || params.agreementId || params.documentId;

  // If draftId is present, we are initializing the agreement
  const isInitializing = !!params.draftId; 
  
  // Check both documents and drafts in the store
  const currentDocument: Document | null = useDocumentStore(state => {
    if (params.draftId) return state.drafts.find(draft => draft.id === params.draftId) || null;
    else if (params.agreementId) return state.agreements.find(agreement => agreement.id === params.agreementId)?.document || null;
    else return null;
  });

  const currentAgreement = useDocumentStore(state => {
    if (params.agreementId) return state.agreements.find(agreement => agreement.id === params.agreementId) || null;
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
    return formCache.get(documentId);
  }, [documentId]);

  // Helper function to check if a transition's conditions are met
  const isTransitionEnabled = React.useCallback((transition: any) => {
    return transition.conditions.every((condition: any) => condition.input.issuer.toLowerCase() === address.toLowerCase());
  }, []);

  const executionInputs = currentDocument?.execution?.inputs || {};
  const states = currentDocument?.execution?.states || {};
  const transitions = currentDocument?.execution?.transitions || [];

  const nextActions = React.useMemo(() => {
    if (!currentAgreement) return null;
    return getNextStates(currentAgreement);
  }, [currentAgreement])
  
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
    onSuccess: async (data) => {
      const newAgreementId = data.data.id;
      
      // First clean up the draft and local storage
      formCache.remove(params.draftId!);
      deleteDraft(params.draftId!);

      // Navigate to agreements list first to trigger a fresh data fetch
      navigate('/', { replace: true });
      
      // Then navigate to the new agreement after a short delay
      setTimeout(() => {
        navigate(`/agreements/${newAgreementId}`, { replace: true });
      }, 500);
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

  // Create mutation for publishing agreement
  const inputMutation = useMutation({
    mutationFn: async ({ values, transition } : { values: Record<string, string>, transition: any}) => {
      if (!currentAgreement || !address) throw new Error("Agreement or address not available");
      const inputValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => key in transition.conditions[0].input.data)
      );
      const vc = await createAgreementInputVC(address as `0x${string}`, transition.conditions[0].input.id, inputValues);
      console.log(transition);
      const input = {
        inputId: transition.conditions[0].input.id,
        inputValue: JSON.parse(vc)
      }
      console.log(input);
      return postAgreementInput(documentId, JSON.stringify(input));
    },
    onSuccess: (data) => {
      console.log(data);
      console.log({
        title: "Input Processed",
        description: "Your input has been successfully processed in the agreement",
        variant: "success",
      });
    },
    onError: (error) => {
      console.log({
        title: "Input Failed",
        description: error.message || "Failed to process input in the agreement",
        variant: "error",
      });
    }
  });

  // Handle transition execution
  const onExecuteTransition = React.useCallback(async (transition) => {
    const data =  {
      values: getCachedValues(),
      transition
    }
    inputMutation.mutate(data)
  }, []);


  if (!currentDocument || !form) {
    return null;
  }

  const { control, formState: { errors }, handleSubmit } = form;

  return (
    <View className="flex flex-col gap-4">
      <Text className="text-sm font-medium text-neutral-11">Actions</Text>

      {/* Initial Action Section */}
      {isInitializing && Object.keys(initialParams).length > 0 && (
        <Card className="p-4">
          <View className="flex flex-col gap-2">
            <Text className="font-semibold">Initialize Agreement</Text>
            <Text className="text-sm text-neutral-11">{"Initialize the agreement with the following parameters"}</Text>
            
            <Input
              value={title}
              variant="underline"
              className="text-primary-12 text-xl font-semibold"
              {...{ onChangeText: handleTitleChange }}
            >
              <Input.Field placeholder="Agreement Title" />
            </Input>
            
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
      {!isInitializing && nextActions && nextActions.length > 0 && nextActions.map((action, index) => {
        const inputs = action.conditions.map((condition) => condition.input);
        // TODO: Handle multiple inputs of different types
        const input = inputs[0];
        return (
          <Card key={index} className="p-4">
            <View className="flex flex-col gap-2">
              <Text className="font-semibold">{input.displayName}</Text>
              <Text className="text-sm text-neutral-11">{input.description}</Text>

              {/* Input fields for variable references in data */}
              {Object.entries(input.data).map(([fieldKey, fieldValue]) => {
                // const variableRefs = extractVariableRefs(fieldValue);
                return (
                  <Controller
                    key={`${fieldKey}.${fieldKey}`}
                    control={control}
                    name={fieldKey}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        variant="underline"
                        placeholder={fieldValue.name}
                        error={errors?.[fieldKey]?.message?.toString()}
                        className="w-full"
                      />
                    )}
                  />
                );
              })}

              <View className="flex flex-row justify-end mt-2">
                <Button 
                  variant="soft" 
                  color="primary" 
                  size="sm"
                  onPress={() => onExecuteTransition(action)}
                  disabled={!isTransitionEnabled(action)}
                  tooltip="hi"
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