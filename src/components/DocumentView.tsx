import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDocumentStore } from '../store/documentStore';
import MarkdownDocumentView from './markdown/MarkdownDocumentView';
import Layout from '../layouts/Layout';
import { getAgreement } from '../api';
import StatusLabel from './StatusLabel';
import { View } from 'react-native';
import { FormContext } from '../contexts/FormContext';
import { Spinner, Text } from '@ds3/react';
import { formCache } from '../utils/formCache';

interface DocumentViewProps {
  type: 'draft' | 'agreement';
}

const DocumentView: React.FC<DocumentViewProps> = ({ type }) => {
  const { draftId, agreementId } = useParams();
  const documentId = type === 'draft' ? draftId : agreementId;
  const { addAgreements, getDraft, getAgreement: getAgreementFromStore } = useDocumentStore();
  const isInitialized = !!agreementId;
  const [fetchedAndLoaded, setFetchedAndLoaded] = React.useState(false);

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
  } = form;

  // Watch form values and update localStorage
  React.useEffect(() => {
    const subscription = watch((values) => {
      if (!documentId) return;
      formCache.set(documentId, values);
    });

    return () => subscription.unsubscribe();
  }, [watch, documentId]);

  // Show loading state while fetching agreement data
  // console.log(isInitialized, isLoadingAgreement);
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
              status={type === 'draft' ? 'draft' : 'signed'} 
              text={type === 'draft' ? 'DRAFT - Initialize Agreement' : 'Published Agreement'} 
            />
          </View>
          <MarkdownDocumentView
            content={document.content}
            variables={document.variables}
            control={control}
            errors={errors}
            editableFields={type === 'draft' ? Object.keys(document.variables) : []}
          />
        </View>  
      </Layout>
    </FormContext.Provider>
  );
};

export default DocumentView; 