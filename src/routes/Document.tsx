import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDocumentStore } from '../store/documentStore';
import MarkdownDocumentView from '../components/MarkdownDocumentView';
import Layout from '../layouts/Layout';
import { getAgreement } from '../api';
import StatusLabel from '../components/StatusLabel';
import { View } from 'react-native';
import { FormContext } from '../contexts/FormContext';
import { Spinner, Text } from '@ds3/react';
import { formCache } from '../utils/formCache';
import { useAccount } from 'wagmi';
import { getNextStates } from '../utils/agreementUtils';

interface DocumentProps {
  type: 'draft' | 'agreement';
}

interface AgreementState {
  Variables: Record<string, { value: string }>;
}

const Document: React.FC<DocumentProps> = ({ type }) => {
  const { draftId, agreementId } = useParams();
  const documentId = type === 'draft' ? draftId : agreementId;
  const { addAgreements, getDraft, getAgreement: getAgreementFromStore } = useDocumentStore();
  const { address } = useAccount();
  const isInitialized = !!agreementId;
  const [fetchedAndLoaded, setFetchedAndLoaded] = React.useState(false);
  const [fetchedValues, setFetchedValues] = React.useState<Record<string, string>>({});

  // Load agreement data if needed
  const { data: agreement, isLoading: isLoadingAgreement } = useQuery({
    queryKey: ['agreement', documentId],
    queryFn: () => getAgreement(documentId!),
    enabled: type === 'agreement',
    refetchOnMount: 'always' as const,
    retry: 2,
  });

  // Effect to handle agreement data
  React.useEffect(() => {
    if (type === 'agreement' && !isLoadingAgreement && agreement) {
      addAgreements([agreement]);
      setFetchedAndLoaded(true);
      const agreementState = agreement.state as unknown as AgreementState;
      if (agreementState.Variables) {
        setFetchedValues(
          Object.fromEntries(
            Object.entries(agreementState.Variables)
              .filter(([_, value]) => value && value.value !== undefined)
              .map(([key, value]) => [key, value.value])
          )
        );
      }
    }
  }, [agreement, isLoadingAgreement, addAgreements, type]);

  // Get current document
  const document = React.useMemo(() => {
    if (type === 'draft') {
      return getDraft(documentId!);
    } else if (fetchedAndLoaded) {
      const agreement = getAgreementFromStore(documentId!);
      return agreement?.document;
    }
  }, [type, documentId, getDraft, getAgreementFromStore, fetchedAndLoaded]);

  // Get next actions
  const nextActions = React.useMemo(() => {
    if (type === 'agreement' && agreement) {
      return getNextStates(agreement);
    }
    // For drafts, use the initial state's transitions
    if (type === 'draft' && document?.execution?.states) {
      const initialState = Object.values(document.execution.states).find(state => state.isInitial);
      if (initialState) {
        return document.execution.transitions
          .filter(transition => transition.from === initialState.name)
          .map(transition => ({
            conditions: transition.conditions.map(condition => ({
              input: document.execution.inputs[condition.input]
            }))
          }));
      }
    }
    return [];
  }, [type, agreement, document]);

  // Get initial params
  const initialParams = React.useMemo(() => {
    if (type === 'draft' && document?.execution?.states) {
      const initialState = Object.values(document.execution.states).find(state => state.isInitial);
      return initialState?.initialParams || {};
    }
    return {};
  }, [type, document]);

  // Form setup
  const form = useForm({
    defaultValues: formCache.getInitialValues(documentId, document || null),
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });

  const {
    formState: { errors },
    control,
    watch,
    reset
  } = form;

  // Need to reset the form values when the document is pulled from the query
  React.useEffect(() => {
    if (document && documentId) {
      reset({
        ...fetchedValues,
        ...Object.fromEntries(
          Object.entries(formCache.getInitialValues(documentId, document || null))
            .filter(([key, value]) => !fetchedValues[key])
        )
      });
    }
  }, [document, documentId, reset, fetchedValues])

  // Watch form values and update localStorage
  React.useEffect(() => {
    const subscription = watch((values) => {
      if (!documentId) return;
      formCache.set(documentId, values);
    });

    return () => subscription.unsubscribe();
  }, [watch, documentId]);

  // Show loading state while fetching agreement data
  if (type === 'agreement' && (!isInitialized || isLoadingAgreement)) {
    return (
      <Layout isLoading={true}>
        <View className="h-full flex items-center justify-center">
          <Spinner size="lg" />
          <Text className="mt-4">Loading agreement...</Text>
        </View>
      </Layout>
    );
  }

  // Show not found state
  if (!document) {
    return (
      <Layout>
        <View className="h-full flex items-center justify-center">
          <Text className="text-neutral-11">Document not found</Text>
        </View>
      </Layout>
    );
  }

  return (
    <FormContext.Provider value={form}>
      <Layout>
        <View className="h-full p-8">
          <View className="mb-6 w-fit">
            <StatusLabel 
              status={type === 'draft' ? 'warning' : undefined} 
              text={type === 'draft' ? 'Draft' : agreement?.state.State.name || 'Published'} 
            />
          </View>
          <MarkdownDocumentView
            content={document.content}
            variables={document.variables}
            control={control}
            errors={errors}
            nextActions={nextActions}
            userAddress={address}
            initialParams={initialParams}
            isInitializing={type === 'draft'}
          />
        </View>  
      </Layout>
    </FormContext.Provider>
  );
};

export default Document; 