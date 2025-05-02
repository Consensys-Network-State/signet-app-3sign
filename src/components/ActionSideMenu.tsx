import * as React from "react";
import { View } from "react-native";
import { useNavigate, useParams } from 'react-router';
import { Text, Card, Button, Input, InputField } from "@ds3/react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@ds3/react";
import { useDocumentStore } from "../store/documentStore";
import { useEditStore } from "../store/editorStore";
import { Controller, UseFormReturn, FieldValues } from "react-hook-form";
import { isAddress } from 'viem';
import AddressCard from "../web3/AddressCard";
import truncateEthAddress from "truncate-eth-address";
import { FormContext } from '../contexts/FormContext';
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Document } from "../store/documentStore";
import { createAgreementInitVC, createAgreementInputVC } from "../utils/veramoUtils";
import { postAgreement, postAgreementInput } from "../api/index";
import { getInitialStateParams, getNextStates } from "../utils/agreementUtils";
import { formCache } from "../utils/formCache";
import { handleTitleChange as handleTitleChangeUtil } from '../utils/documentUtils';
import VariableInput, { createValidationRules } from './form/VariableInput';
import ConfirmActionDialog from './ConfirmActionDialog';

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

interface TransitionAction {
  to: DocumentState;
  conditions: Array<{
    type: string;
    input: {
      id: string;
      issuer: any;
      data: Record<string, any>;
      type: string;
      schema?: string;
      displayName: string;
      description: string;
    };
  }>;
}

interface DocumentState {
  description: string;
  id: string;
  name: string;
  isInitial: boolean;
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
  const { deleteDraft } = useDocumentStore();
  const { getCurrentDraft: getCurrentBlockNoteDraft, updateDraftTitle: updateBlockNoteDraftTitle } = useEditStore();
  const { getCurrentDraft: getCurrentMarkdownDraft, updateDraftTitle: updateMarkdownDraftTitle, updateAgreement } = useDocumentStore();
  const navigate = useNavigate();

  // Add loading states for each action type
  const [isInitializingAction, setIsInitializingAction] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);

  const blockNoteDraft = getCurrentBlockNoteDraft();
  const markdownDraft = getCurrentMarkdownDraft();
  
  const [title, setTitle] = React.useState(
    blockNoteDraft?.title || 
    markdownDraft?.metadata?.name || 
    'Untitled Agreement'
  );

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
  
  // Get form state and validation trigger - handle undefined form
  const errors = form?.formState?.errors;
  const trigger = form?.trigger;
  const getValues = form?.getValues;
  
  // Helper function to get input details from template
  const getInputDetails = (inputId: string): DocumentInput | undefined => {
    // Use test inputs for now
    return TEST_INPUTS[inputId as keyof typeof TEST_INPUTS] || executionInputs[inputId];
  };

  // Get cached form values
  const getCachedValues = React.useCallback(() => {
    if (!documentId) return {};
    return formCache.get(documentId);
  }, [documentId]);

  // Helper function to check if a transition's conditions are met
  const isTransitionEnabled = React.useCallback((transition: any) => {
    return transition.conditions.every((condition: any) => condition.input.issuer.toLowerCase() === address?.toLowerCase());
  }, [address]);

  // Helper to check if fields for a transition are valid
  const areTransitionFieldsValid = React.useCallback(async (transition: TransitionAction) => {
    if (!trigger) return true; // If no form context, assume valid
    
    // Get all fields that need to be validated from the input data
    const fieldsToValidate = Object.keys(transition.conditions[0].input.data);
    
    // Validate all required fields
    const result = await trigger(fieldsToValidate, { shouldFocus: true });
    
    // Check if any required fields are empty
    if (result && getValues) {
      const values = getValues();
      const hasEmptyRequiredFields = fieldsToValidate.some(field => {
        const value = values[field];
        const variable = currentDocument?.variables[field];
        return variable?.validation?.required && !value;
      });
      return !hasEmptyRequiredFields;
    }
    
    return result;
  }, [trigger, getValues, currentDocument?.variables]);

  const executionInputs = currentDocument?.execution?.inputs || {};

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

  const onPublish = React.useCallback(async () => {
    if (!trigger || !getValues) return; // Don't proceed if no form context
    setIsInitializingAction(true);
    try {
      // Validate all initial params
      const fieldsToValidate = Object.keys(initialParams);
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        setIsInitializingAction(false);
        return;
      }

      // Then proceed with publication
      await publishMutation.mutateAsync(getValues());
    } catch (error: any) {
      console.error('Failed to publish:', error);
      console.log({
        title: "Publication Failed",
        description: error?.message || "Failed to publish agreement",
        variant: "error",
      });
    } finally {
      setIsInitializingAction(false);
    }
  }, [initialParams, trigger, getValues, publishMutation]);

  // Create mutation for publishing agreement
  const inputMutation = useMutation({
    mutationFn: async ({ values, transition } : { values: Record<string, string>, transition: any}) => {
      if (!currentAgreement || !address) throw new Error("Agreement or address not available");
      const inputValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => key in transition.conditions[0].input.data)
      );
      const vc = await createAgreementInputVC(address as `0x${string}`, transition.conditions[0].input.id, inputValues);

      const input = {
        inputId: transition.conditions[0].input.id,
        inputValue: JSON.parse(vc)
      }

      return postAgreementInput(documentId!, JSON.stringify(input));
    },
    onSuccess: (data) => {
      updateAgreement(currentAgreement!.id, {
        ...currentAgreement!,
        ...data.data.updatedState
      });
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

  const onExecuteTransition = React.useCallback(async (transition: TransitionAction) => {
    if (!trigger || !getValues) return; // Don't proceed if no form context
    
    setIsExecuting(true);
    try {
      // First validate the required fields
      const isValid = await areTransitionFieldsValid(transition);
      if (!isValid) {
        console.log({
          title: "Validation Failed",
          description: "Please fill in all required fields correctly",
          variant: "error",
        });
        setIsExecuting(false);
        return;
      }

      // Then proceed with the transition
      const data = {
        values: getValues(),
        transition
      };
      await inputMutation.mutateAsync(data);
    } catch (error: any) {
      console.error('Failed to execute transition:', error);
      console.log({
        title: "Execution Failed",
        description: error?.message || "Failed to execute transition",
        variant: "error",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [getValues, areTransitionFieldsValid, inputMutation, trigger]);

  // Replace confirmDialog state to also track transition
  const [confirmDialog, setConfirmDialog] = React.useState<null | { type: 'publish' | 'transition', transition?: TransitionAction }>(null);

  // Handler to open dialog after validation
  const handleConfirm = async (type: 'publish' | 'transition', transition?: TransitionAction) => {
    if (type === 'publish') {
      if (!trigger || !getValues) return;
      const fieldsToValidate = Object.keys(initialParams);
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
      setConfirmDialog({ type });
    } else if (type === 'transition' && transition) {
      if (!trigger || !getValues) return;
      const fieldsToValidate = Object.keys(transition.conditions[0].input.data);
      const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
      if (!isValid) return;
      setConfirmDialog({ type, transition });
    }
  };

  const handleCloseDialog = () => setConfirmDialog(null);

  const handleConfirmAction = async () => {
    if (confirmDialog?.type === 'publish') {
      await onPublish();
    } else if (confirmDialog?.type === 'transition' && confirmDialog.transition) {
      await onExecuteTransition(confirmDialog.transition);
    }
    setConfirmDialog(null);
  };

  if (!currentDocument || !form) {
    return null;
  }

  const { control } = form;

  return (
    <View className="flex flex-col gap-4">
      {currentAgreement && currentAgreement.state.IsComplete
        ? <>
          <Text className="text-md font-medium text-neutral-11">{currentAgreement.state.State.name}</Text>
          <Text className="text-sm font-medium text-neutral-11">{currentAgreement.state.State.description}</Text>
        </>
        : <Text className="text-sm font-medium text-neutral-11">Actions</Text> 
      }

      {/* Initial Action Section - Only show in draft mode */}
      {isInitializing && Object.keys(initialParams).length > 0 && (
        <Card className="p-4">
          <View className="flex flex-col gap-2">
            <Text className="font-semibold">Initialize Agreement</Text>
            <Text className="text-sm text-neutral-11">{"Initialize the agreement with the following parameters"}</Text>
            
            <Input
              value={title}
              variant="underline"
              className="text-primary-12 text-xl font-semibold"
              {...{ onChangeText: setTitle }}
            >
              <Input.Field />
            </Input>
            
            {Object.entries(initialParams).map(([paramKey]) => {
              const variable = currentDocument?.variables?.[paramKey];
              if (!variable) return null;
              
              return (
                <Controller
                  key={paramKey}
                  control={control}
                  name={paramKey}
                  rules={createValidationRules(variable)}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <VariableInput
                      name={paramKey}
                      variable={variable}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      error={errors?.[paramKey]?.message}
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
                onPress={() => handleConfirm('publish')}
                loading={isInitializingAction}
              >
                <Button.Spinner />
                <Button.Text>{isInitializingAction ? 'Initializing...' : 'Initialize'}</Button.Text>
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* Available Transitions Section */}
      {!isInitializing && nextActions && nextActions.length > 0 && nextActions.map((action, index) => {
        const inputs = action.conditions.map((condition) => condition.input);
        const input = inputs[0];
        const transitionEnabled = isTransitionEnabled(action);
        return (
          <Card key={index} className="p-4">
            <View className="flex flex-col gap-2">
              <Text className="font-semibold">{input.displayName}</Text>
              <Text className="text-sm text-neutral-11">{input.description}</Text>

              {/* Input fields for variable references in data */}
              {Object.entries(input.data).map(([fieldKey]) => {
                const variable = currentDocument?.variables?.[fieldKey];
                if (!variable) return null;
                
                return (
                  <Controller
                    key={`${fieldKey}.${fieldKey}`}
                    control={control}
                    name={fieldKey}
                    rules={createValidationRules(variable)}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <VariableInput
                        name={fieldKey}
                        variable={variable}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        error={errors?.[fieldKey]?.message}
                        className="w-full"
                        disabled={!transitionEnabled}
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
                  onPress={() => handleConfirm('transition', action as TransitionAction)}
                  loading={isExecuting}
                  disabled={!transitionEnabled}
                >
                  <Button.Spinner />
                  <Button.Text>{isExecuting ? 'Executing...' : 'Execute'}</Button.Text>
                </Button>
              </View>
              {!transitionEnabled && (
                <View className="bg-error-2 border border-error-7 rounded p-3 mt-3">
                  <Text className="text-xs text-error-10">
                    You are not authorized to perform this action or edit these fields.
                  </Text>
                  <View className="mt-2">
                    <Text className="text-xs text-neutral-11 mb-2">Authorized signer:</Text>
                    <AddressCard
                      address={input.issuer as `0x${string}`}
                      className="h-8"
                      avatarClassName="w-5 h-5"
                    />
                  </View>
                </View>
              )}
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

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        open={!!confirmDialog}
        onOpenChange={handleCloseDialog}
        onConfirm={handleConfirmAction}
        loading={isInitializingAction || isExecuting}
        type={confirmDialog?.type || 'publish'}
      />
    </View>
  );
};

export default ActionSideMenu; 