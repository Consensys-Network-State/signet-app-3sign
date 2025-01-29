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
import { useForm, Controller } from 'react-hook-form';
import {createDocumentVC} from "../utils/veramoUtils.ts";
import { useAccount } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import {postDocument} from "../api";
import * as React from "react";
import { useNavigate } from "react-router";
import { Upload } from 'lucide-react-native';


interface ExportFormData {
  signatories: string;
}

interface ExportDialogProps {
  editor: any;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ editor }) => {
  const {handleSubmit, formState: { errors }, control} = useForm<ExportFormData>({
    defaultValues: {
      signatories: ""
    }
  });

  const mutation = useMutation({
    mutationFn: postDocument
  })

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const { address } = useAccount();
  const navigate = useNavigate();

  const onSubmit = async (data: ExportFormData) => {
    try {
      if (!address) throw new Error('Not signed in');
      setError("");
      setIsLoading(true);
      const document = await createDocumentVC(address, data.signatories.split(',') as `0x${string}`[], editor.document);
      mutation.mutate(document, {
        onError: (error) => {
          setIsLoading(false);
          setError(error.message);
        },
        onSuccess: (data) => {
          setIsLoading(false);
          if (data) {
            const { processId } = data.data || {};
            navigate(`/${processId}`, { state: { showModal: true } })
          }
        },
      });

    } catch (error: any) {
      setError('Failed to sign document');
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='soft' color="primary">
          <Button.Icon icon={Upload} />
          <Button.Text>Publish</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <>
            <DialogTitle>Export Doc</DialogTitle>
            <DialogDescription>
              Set signatories and sign to export doc
            </DialogDescription>
          </>
        </DialogHeader>
        <>
          <Controller
            control={control}
            name="signatories"
            rules={{
              required: 'signatories are required'
            }}
            render={({ field }) => (
              <InputField
                label="Signatories"
                placeholder="e.g. 0x1232..."
                multiline
                numberOfLines={4}
                error={errors?.signatories?.message as string}
                {...field}
              />
            )}
          />
          { !!error &&
            <Text className="text-sm color-error-a11">
              Something went wrong: {error}
            </Text>
          }
        </>
        <DialogFooter>
          <>
            <DialogClose asChild>
              <Button variant='ghost'>
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
              <Button.Spinner />
              <Button.Text>Export</Button.Text>
            </Button>
          </>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default ExportDialog;