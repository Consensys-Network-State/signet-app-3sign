import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useDocumentStore, Agreement, Document } from '../store/documentStore';
import MarkdownDocumentView from './markdown/MarkdownDocumentView';
import Layout from '../layouts/Layout';
import { getAgreementByUserId } from '../api';
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
  const { addAgreements, getDraft, getAgreement } = useDocumentStore();
  const { address } = useAccount();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load agreement data if needed
  const { data: agreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ['agreements', address, documentId],
    queryFn: () => getAgreementByUserId(address as string),
    enabled: type === 'agreement',
    refetchOnMount: 'always' as const,
    retry: 2,
  });

  // Effect to handle agreement data
  React.useEffect(() => {
    if (type === 'agreement' && !isLoadingAgreements && agreements?.data) {
      addAgreements(agreements.data);
      setIsInitialized(true);
    }
  }, [agreements, isLoadingAgreements, addAgreements, type]);

  // Get current document
  const document = React.useMemo(() => {
    if (type === 'draft') {
      return getDraft(documentId!);
    } else {
      const agreement = getAgreement(documentId!);
      return agreement?.document;
    }
  }, [type, documentId, getDraft, getAgreement]);

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

  // Watch form values and update localStorage
  React.useEffect(() => {
    const subscription = watch((values) => {
      if (!documentId) return;
      formCache.set(documentId, values);
    });

    return () => subscription.unsubscribe();
  }, [watch, documentId]);

  // Show loading state while fetching agreement data
  if (type === 'agreement' && (!isInitialized || isLoadingAgreements)) {
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