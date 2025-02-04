import {
  Text,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  InputField,
} from '@ds3/react';
import { createSignatureVC } from "../utils/veramoUtils.ts";
import { useAccount } from "wagmi";
import { postSignature } from "../api";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentPayload } from "../types";
import * as React from "react";
import { Upload } from 'lucide-react-native';

interface EthSignDialogProps {
  documentPayload?: DocumentPayload,
  editor: any;
  disabled?: boolean;
  isSimulationMode?: boolean;
  onSuccessfulSignature?: (data: any) => void;
  triggerProps?: any
}

const EthSignDialog: React.FC<EthSignDialogProps> =({
    editor,
    onSuccessfulSignature,
    disabled = false,
    isSimulationMode = false,
    documentPayload,
    triggerProps = {}
}) => {

  const [sigVC, setSigVC] = React.useState<string | null>(null);

  const { address } = useAccount();

  const mutation = useMutation({
    mutationFn: ({ documentId, signatureVC }: { documentId: string, signatureVC: string }) => postSignature(documentId, signatureVC)
  });

  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");


  const handleSimulateSignature = async () => {
    const signatureVC = await createSignatureVC(address as `0x${string}`, editor.document, 'SIMULATION_VC');
    setSigVC(signatureVC);
  }
  const handleSign = async () => {
    setError("");
    setIsLoading(true);
    try {
      const signatureVC = await createSignatureVC(address as `0x${string}`, editor.document, documentPayload!.raw.Document);
      mutation.mutate(
          {documentId: documentPayload!.documentId, signatureVC},
          {
            onError: (error) => {
              setIsLoading(false);
              setError(error.message);
            },
            onSuccess: () => {
              setIsLoading(false);
              // setSigVC(signatureVC)
              queryClient.invalidateQueries({queryKey: ['documents', documentPayload!.documentId]})
              // Close this Modal
              setIsOpen(false);
              // Open Upstream Modal + send signature VC with it
              if (onSuccessfulSignature) {
                onSuccessfulSignature(signatureVC);
              }
            },
          }
      );
    } catch (e) {
      setIsLoading(false);
      setError('Failed to sign document. Please try again.');
    }
  }

  const Footer = React.useMemo(() => {
    if (!sigVC) {
      return <>
        <DialogClose asChild>
          <Button variant='ghost' onPress={() => setIsOpen(false)}>
            <Text>Cancel</Text>
          </Button>
        </DialogClose>

        <Button variant="soft" color="primary" onPress={isSimulationMode ? handleSimulateSignature: handleSign} loading={isLoading}>
          <Button.Spinner />
          <Button.Text>{isLoading ? 'Submitting...' : 'Submit'}</Button.Text>
        </Button>
      </>
    }
    return (
      <DialogClose asChild>
        <Button variant='ghost'>
          <Button.Text>Close</Button.Text>
        </Button>
      </DialogClose>
    );
  }, [sigVC, isSimulationMode, handleSign, handleSimulateSignature, isLoading])

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {/* todo: make solid */}
        <Button variant='soft' color="primary" onPress={() => setIsOpen(true)} {...triggerProps}>
          <Button.Icon icon={Upload} />
          <Button.Text>Submit Signature</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        { !!sigVC ?
            <>
              <DialogHeader>
                <DialogTitle>Submit Signature</DialogTitle>
                <DialogDescription>
                  You have successfully signed the agreement
                </DialogDescription>
              </DialogHeader>
              <InputField disabled value={sigVC} multiline numberOfLines={4} label={"This is your portable VC"}/>
            </> :
            <DialogHeader>
              <DialogTitle>Complete Signing</DialogTitle>
              <DialogDescription>
                You will be prompted to sign this completed agreement with your meta mask wallet which will generate a verifiable claim that will be published against the original agreement.
                This action is irreversible.
              </DialogDescription>
            </DialogHeader>
        }
        { !!error &&
            <Text className="text-sm color-error-a11">
              Something went wrong: {error}
            </Text>
        }
        <DialogFooter>
          { Footer }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default EthSignDialog;