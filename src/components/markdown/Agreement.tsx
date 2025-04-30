import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@ds3/react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useMutation } from '@tanstack/react-query';
import { createAgreementInitVC } from '../../utils/veramoUtils.ts';
import { postAgreement } from '../../api';
import { useDocumentStore, DocumentVariable, DocumentState } from '../../store/documentStore';
import { Document } from "../../store/documentStore";
import MarkdownDocumentView from './MarkdownDocumentView';

const Draft: React.FC = () => {
  const { agreementId } = useParams<{ agreementId: string }>();
  const { getDocument } = useDocumentStore();
  const { address } = useAccount();
  const navigate = useNavigate();

  const agreement = React.useMemo(() => {
    if (agreementId) return getDocument(agreementId);
    return null;
  }, [agreementId, getDocument]);

  if (!agreementId || !agreement) {
    return null;
  }

  // Get initial values from localStorage or draft
  const getInitialValues = React.useCallback(() => {
    // const storedValues = localStorage.getItem(`draft_${draftId}_values`);
    // if (storedValues) {
    //   return JSON.parse(storedValues);
    // }
    return Object.entries(agreement.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: variable.value || ''
    }), {} as Record<string, string>);
  }, [agreement]);

  const form = useForm({
    defaultValues: getInitialValues(),
    mode: 'onBlur',
    reValidateMode: 'onBlur'
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch
  } = form;


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

//   const rightHeader = (
//     <>
//       <Button 
//         variant="soft" 
//         color="primary" 
//         onPress={handleSubmit(onSubmit)}
//       >
//         <Button.Text>Save</Button.Text>
//       </Button>
//       <Button 
//         variant="soft" 
//         color="primary" 
//         onPress={handleSubmit(onPublish)}
//         isLoading={publishMutation.isPending}
//         isDisabled={publishMutation.isPending}
//       >
//         <Button.Text>{publishMutation.isPending ? 'Publishing...' : 'Publish'}</Button.Text>
//       </Button>
//     </>
//   );

  return (
    <MarkdownDocumentView
      content={agreement.content}
      variables={agreement.variables}
    //   rightHeader={rightHeader}
      control={control}
      errors={errors}
    //   editableFields={Object.keys(initialInputs)}
    />
  );
};

export default Draft;
