import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDocumentStore } from '../store/documentStore';
import MarkdownDocumentView from '../components/MarkdownDocumentView';
import Layout from '../layouts/Layout';
import { getAgreement } from '../api';
import StatusLabel from '../components/StatusLabel';
import { FormContext } from '../contexts/FormContext';
import { Spinner } from '@ds3/ui';
import { formCache } from '../utils/formCache';
import { useAccount } from 'wagmi';
import { getNextStates } from '../utils/agreementUtils';
import { useAgreement } from '../store/selectors';
import ErrorBoundary from '../components/ErrorBoundary';

interface DocumentProps {
  type: 'draft' | 'agreement';
}

interface AgreementState {
  Variables: Record<string, { value: string }>;
}

// Custom fallback for the markdown content section
const MarkdownFallback = () => (
  <div className="p-4 border border-error-7 rounded bg-error-3">
    <h3 className="font-bold">Document Rendering Error</h3>
    <p className="my-2">There was a problem displaying the document content.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-primary-9 text-white rounded hover:bg-primary-10 transition-colors"
    >
      Reload Document
    </button>
  </div>
);

const Document: React.FC<DocumentProps> = ({ type }) => {
  const { draftId, agreementId } = useParams();
  const documentId = type === 'draft' ? draftId : agreementId;
  const { addAgreements, getDraft } = useDocumentStore();
  const { address } = useAccount();
  const isInitialized = !!agreementId;
  const [fetchedValues, setFetchedValues] = React.useState<Record<string, string>>({});

  const agreement = useAgreement(agreementId);

  // Load agreement data if needed
  const { data: fetchedAgreement, isLoading: isLoadingAgreement } = useQuery({
    queryKey: ['agreement', documentId],
    queryFn: () => getAgreement(documentId!),
    enabled: type === 'agreement',
    refetchOnMount: 'always' as const,
    retry: 2,
  });

  // Effect to handle agreement data
  React.useEffect(() => {
    if (type === 'agreement' && !isLoadingAgreement && fetchedAgreement) {
      addAgreements([fetchedAgreement]);
      const agreementState = fetchedAgreement.state as unknown as AgreementState;
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
  }, [fetchedAgreement, isLoadingAgreement, addAgreements, type]);

  // Get current document
  const document = React.useMemo(() => {
    if (type === 'draft') {
      return getDraft(documentId!);
    } else if (agreement) {
      return agreement.document;
    }
  }, [type, documentId, getDraft, agreement]);

  // Get next actions
  const nextActions = React.useMemo(() => {
    if (type === 'agreement' && agreement) {
      const actions = getNextStates(agreement);
      // Map to the expected type for MarkdownDocumentView
      return actions.map(action => ({
        conditions: action.conditions
          .filter((condition): condition is NonNullable<typeof condition> => 
            condition !== undefined && condition.input !== undefined)
          .map(condition => ({ input: condition.input }))
      }));
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
            .filter(([key]) => !fetchedValues[key])
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
        <div className="h-full flex items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4">Loading agreement...</p>
        </div>
      </Layout>
    );
  }

  // Show not found state
  if (!document) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <p className="text-neutral-11">Document not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <FormContext.Provider value={form}>
      <Layout>
        <div className="h-full p-8">
          <div className="mb-6 w-fit">
            <StatusLabel 
              status={type === 'draft' ? 'warning' : undefined} 
              text={type === 'draft' ? 'Draft' : agreement?.state.State.name || 'Published'} 
            />
          </div>
          <ErrorBoundary fallback={<MarkdownFallback />}>
            <MarkdownDocumentView
              content={document.content || { type: 'md', data: 'No content available' }}
              variables={document.variables || {}}
              control={control}
              errors={errors || {}}
              nextActions={nextActions || []}
              userAddress={address || ''}
              initialParams={initialParams || {}}
              isInitializing={type === 'draft'}
            />
          </ErrorBoundary>
        </div>  
      </Layout>
    </FormContext.Provider>
  );
};

export default Document; 