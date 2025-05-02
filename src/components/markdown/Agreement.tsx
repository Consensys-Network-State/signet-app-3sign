import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useDocumentStore, Agreement } from '../../store/documentStore';
import MarkdownDocumentView from './MarkdownDocumentView';
import Layout from '../../layouts/Layout.tsx';
import { getAgreementByUserId } from '../../api/index.ts';
import StatusLabel from '../StatusLabel.tsx';
import { DraftFormContext } from './Draft.tsx';
import { View } from 'react-native';

const Draft: React.FC = () => {
  const { agreementId } = useParams<{ agreementId: string }>();
  const { addAgreements } = useDocumentStore();
  const { address } = useAccount();
  const [agreement, setAgreement] = React.useState<Agreement | null>(null);

  // Get initial values from localStorage or agreement state
  const getInitialValues = React.useCallback(() => {
    if (!agreement || !agreementId) return {};
    
    const storedValues = localStorage.getItem(`agreement_${agreementId}_values`);
    if (storedValues) {
      return JSON.parse(storedValues);
    }

    // Fallback to agreement state values
    return Object.entries(agreement.state.Variables || {}).reduce((acc, [key, variable]: [string, any]) => ({
      ...acc,
      [key]: variable?.value || ''
    }), {} as Record<string, string>);
  }, [agreementId, agreement]);

  // TODO: This should ideally be a query for the specific agreement ID. No such endpoint exists yet.
  const { data: agreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: [],
    queryFn: () => getAgreementByUserId(address as string),
  });

  React.useEffect(() => {
    if (!isLoadingAgreements && agreements) {
      // TODO: the state is also queried here (agreement.state). Need to determine how we store and display this.
      addAgreements(agreements.data || [])
      setAgreement(agreements.data.find((agreement: Agreement) => agreement.id === agreementId) || null)
    }
  }, [agreements, isLoadingAgreements, addAgreements])

  const form = useForm({
    defaultValues: getInitialValues(),
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset
  } = form;

  // Watch form values and update localStorage
  React.useEffect(() => {
    const subscription = watch((values) => {
      if (!values) return;
      localStorage.setItem(`agreement_${agreementId}_values`, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch, agreementId]);

  // Reset form when agreement changes
  React.useEffect(() => {
    if (agreement) {
      const initialValues = getInitialValues();
      reset(initialValues);
    }
  }, [agreement, reset, getInitialValues]);

  if (isLoadingAgreements) {
    return <div>Loading...</div>;
  }

  if (!agreement) return null; // TODO: Handle Error

  return (
    <>
      <DraftFormContext.Provider value={form}>
        <Layout>
          <View className="h-full p-8">
            <View className="mb-6 w-fit">
              <StatusLabel status="draft" text="Published Agreement -- TODO: Add status" />
            </View>
            <MarkdownDocumentView
              content={agreement.document.content}
              variables={agreement.document.variables}
              control={control}
              errors={errors}
              // editableFields={Object.keys(initialInputs)}
            />
          </View>  
        </Layout>
      </DraftFormContext.Provider>
    </>
  );
};

export default Draft;
