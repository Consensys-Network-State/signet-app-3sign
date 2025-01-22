import {FC, useEffect, useMemo, useState} from 'react';
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
  TextArea,
} from '@ds3/react';
import {createSignatureVC} from "../utils/veramoUtils.ts";
import { useAccount } from "wagmi";
import {postSignature} from "../api";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {DocumentPayload} from "../types";

interface EthSignDialogProps {
  documentPayload?: DocumentPayload,
  editor: any;
  disabled?: boolean;
  isSimulationMode?: boolean;
}

const EthSignDialog: FC<EthSignDialogProps> =({ editor, disabled = false, isSimulationMode = false, documentPayload }) => {

  const [sigVC, setSigVC] = useState<string | null>(null);

  const { address } = useAccount();

  const mutation = useMutation({
    mutationFn: ({ documentId, signatureVC }: { documentId: string, signatureVC: string }) => postSignature(documentId, signatureVC)
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['documents', documentPayload!.documentId] })
    }
  }, [mutation.isSuccess])

  const handleSimulateSignature = async () => {
    const signatureVC = await createSignatureVC(address as `0x${string}`, editor.document, 'SIMULATION_VC');
    setSigVC(signatureVC);
  }
  const handleSign = async () => {
    const signatureVC = await createSignatureVC(address as `0x${string}`, editor.document, documentPayload!.documentVC);
    mutation.mutate({ documentId: documentPayload!.documentId, signatureVC });
  }

  const Footer = useMemo(() => {
    if (isSimulationMode) {
      return <>
        { !sigVC ?
          <>
            <DialogClose asChild>
              <Button variant='ghost'>
                <Text>Cancel</Text>
              </Button>
            </DialogClose>

            <Button onPress={handleSimulateSignature}>
              <Text>Sign</Text>
            </Button>
          </> :
          <DialogClose asChild>
            <Button variant='ghost' onPress={() => {setSigVC(null)}}>
              <Text>Finish</Text>
            </Button>
          </DialogClose>
        }
      </>
    } else {
      return <>
        <DialogClose asChild>
          <Button variant='ghost'>
            <Text>Cancel</Text>
          </Button>
        </DialogClose>

        <DialogClose asChild>
          <Button onPress={handleSign}>
            <Text>Sign &amp; Finish</Text>
          </Button>
        </DialogClose>
      </>
    }
  }, [sigVC, isSimulationMode])

  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant='outline'>
          <Text>Signing Dialog</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        { sigVC ?
            <TextArea value={sigVC} /> :
            <DialogHeader>
              <DialogTitle>Complete Signing</DialogTitle>
              <DialogDescription>
                Sign the full document now to complete the signing ceremony and finalize the agreement.
              </DialogDescription>
            </DialogHeader>
        }
        <DialogFooter>
          { Footer }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default EthSignDialog;