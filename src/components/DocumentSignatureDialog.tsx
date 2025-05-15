import { useForm, Controller } from 'react-hook-form';
import {
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
  Card,
  CardContent,
  Label,
} from '@ds3/ui';
import DocumentSignature from "./DocumentSignature";
import React from "react";
import { Signature as SignatureIcon } from 'lucide-react-native';

interface DocumentSignatureDialogProps {
  children?: React.ReactNode;
  name?: string;
  value?: string;
  onSignatureAdopted: (signature: string) => void;
  disabled?: boolean;
  error?: string;
}

export type FormData = {
  signature: string,
};

const DocumentSignatureDialog: React.FC<DocumentSignatureDialogProps> = (props: DocumentSignatureDialogProps) => {
  const form = useForm<FormData>({
    defaultValues: {
      signature: props.value || '',
    }
  });

  const {
    reset,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = form;

  const [isOpen, setIsOpen] = React.useState(false);

  // Reset form with current value when opening modal
  React.useEffect(() => {
    if (isOpen && props.value) {
      reset({ signature: props.value });
    }
  }, [isOpen, props.value, reset]);

  const onSubmit = (data: FormData) => {
    props.onSignatureAdopted(data.signature);
    setIsOpen(false);
    reset();
  };

  const { signature } = watch();

  const dialogContent = (
    <DialogContent className='w-[520px] max-w-[520px]'>
      <DialogHeader>
        <DialogTitle>Adopt Your Signature</DialogTitle>
        <DialogDescription>
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="signature"
              rules={{
                required: 'Signature is required'
              }}
              render={({ field }) => (
                <InputField
                  label="Signature"
                  placeholder="Type your signature"
                  error={errors?.signature?.message as string}
                  {...field}
                />
              )}
            />

            <Label><p>Preview</p></Label>

            <Card className='w-full'>
              <CardContent className='p-4'>
                {signature ?
                  <DocumentSignature name={signature} signature={signature} /> :
                  <p className="text-center">Enter your signature to preview.</p>
                }
              </CardContent>
            </Card>
          </div>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant='ghost'>
            <Button.Text>Cancel</Button.Text>
          </Button>
        </DialogClose>
        <Button
          variant="soft"
          color="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
        >
          <Button.Text>Adopt Signature</Button.Text>
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  // If we have an existing signature, show it with edit capability
  if (props.value) {
    return (
      <>
        <DocumentSignature 
          name={props.name} 
          signature={props.value} 
          onEdit={() => setIsOpen(true)}
          disabled={props.disabled}
        />
        {props.error && (
          <p className="text-error-10 text-xs mt-2">{props.error}</p>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          {dialogContent}
        </Dialog>
      </>
    );
  }

  // Initial signature creation view
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={props.disabled}>
        <Button variant='dashed' color="primary">
          <Button.Icon icon={SignatureIcon}/>
          <Button.Text>Click here to sign</Button.Text>
        </Button>
      </DialogTrigger>
      {props.error && (
        <p className="text-error-10 text-sm mt-2">{props.error}</p>
      )}
      {dialogContent}
    </Dialog>
  );
};

export default DocumentSignatureDialog; 