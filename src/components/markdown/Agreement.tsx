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
  const { getAgreement, addAgreements } = useDocumentStore();
  const { address } = useAccount();
  const navigate = useNavigate();
  const [agreement, setAgreement] = React.useState<Agreement | null>(null);

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

  const initialValues = React.useMemo(() => {
    if (!agreement || !agreement.document || !agreement.document.variables) {
      return null;
    }
    
    return Object.entries(agreement.state.Variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: variable.value || ''
    }), {} as Record<string, string>);
  }, [agreement]);

  const form = useForm({
    defaultValues: {},
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

  React.useEffect(() => {
    if (agreement && initialValues) {
      reset(initialValues);
    }
  }, [agreement, form, initialValues]);

  // Watch form values and update localStorage
//   React.useEffect(() => {
//     const subscription = watch((values) => {
//       if (!values) return;
//       localStorage.setItem(`draft_${draftId}_values`, JSON.stringify(values));
//     });

//     return () => subscription.unsubscribe();
//   }, [watch, draftId]);

  // Only update draft on submit
//   const onSubmit = React.useCallback((values: Record<string, string>) => {
//     if (!draft) return;

//     const updatedVariables = Object.entries(draft.variables).reduce((acc, [key, variable]) => ({
//       ...acc,
//       [key]: {
//         ...variable,
//         value: values[key] || ''
//       }
//     }), {} as Record<string, DocumentVariable>);

//     console.log(updatedVariables);

//     updateDraft(draftId, draft.content.data as string, updatedVariables);
//     localStorage.removeItem(`draft_${draftId}_values`);
//   }, [draft, draftId, updateDraft]);

//   // Create mutation for publishing agreement
//   const publishMutation = useMutation({
//     mutationFn: async (values: Record<string, string>) => {
//       if (!draft || !address) throw new Error("Draft or address not available");
      
//       const vc = await createAgreementInitVC(address as `0x${string}`, draft as Document, values);
//       return postAgreement(vc);
//     },
//     onSuccess: () => {
//       console.log({
//         title: "Agreement Published",
//         description: "Your agreement has been successfully published",
//         variant: "success",
//       });
//       localStorage.removeItem(`draft_${draftId}_values`);
//       deleteDraft(draftId);
//       navigate(`/`);
//     },
//     onError: (error) => {
//       console.log({
//         title: "Publication Failed",
//         description: error.message || "Failed to publish agreement",
//         variant: "error",
//       });
//     }
//   });

//   const onPublish = React.useCallback((values: Record<string, string>) => {
//     publishMutation.mutate(values);
//   }, [publishMutation]);

  const currentState = React.useMemo(() => {
    if (!agreement) return null;
    return agreement.state.State;
  }, [agreement])

  const nextStates = React.useMemo(() => {
    if (!agreement) return null;
    return agreement.document.execution.transitions
        .filter((transition) => transition.from === currentState!.id)
        .map((transition) => ({
            to: agreement.document.execution.states[transition.to],
            conditions: transition.conditions.map((condition) => ({
                type: condition.type,
                input: agreement.document.execution.inputs[condition.input]
            }))
        }));
  }, [currentState, agreement])

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
        {/* <>
        <Text>
            Current State: {currentState.name}
        </Text>
        <Text>...........................</Text>
        <Text>
            Next States: {nextStates.map((state) => state.to.name).join(', ')}
        </Text>
        </> */}
        {/* <Layout>
            <MarkdownDocumentView
                content={agreement.document.content}
                variables={agreement.document.variables}
                //   rightHeader={rightHeader}
                control={control}
                errors={errors}
                //   editableFields={Object.keys(initialInputs)}
            />
        </Layout> */}
    </>
  );
};

export default Draft;
