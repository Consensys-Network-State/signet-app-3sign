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
import {createSignatureVC} from "../utils/veramoUtils.ts";
import { useAccount } from "wagmi";
import {postSignature} from "../api";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {DocumentPayload} from "../types";
import * as React from "react";
import { Signature } from 'lucide-react-native';

interface EthSignDialogProps {
  documentPayload?: DocumentPayload,
  editor: any;
  disabled?: boolean;
  isSimulationMode?: boolean;
  onSuccessfulSignature?: (data: any) => void;
}

const EthSignDialog: React.FC<EthSignDialogProps> =({ editor, onSuccessfulSignature, disabled = false, isSimulationMode = false, documentPayload }) => {

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

        <Button onPress={isSimulationMode ? handleSimulateSignature: handleSign} loading={isLoading}>
          <Button.Spinner />
          <Button.Text>Sign &amp; Finish</Button.Text>
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
  }, [sigVC, isSimulationMode])

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant='soft' color="primary" onPress={() => setIsOpen(true)}>
          <Button.Icon icon={Signature} />
          <Button.Text>Sign</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        { !!sigVC ?
            <>
              <DialogHeader>
                <DialogTitle>Success!</DialogTitle>
                <DialogDescription>
                  You have successfully signed the agreement
                </DialogDescription>
              </DialogHeader>
              <InputField disabled value={sigVC} multiline numberOfLines={4} label={"This is your portable VC"}/>
            </> :
            <DialogHeader>
              <DialogTitle>Complete Signing</DialogTitle>
              <DialogDescription>
                Sign the full document now to complete the signing ceremony and finalize the agreement.
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