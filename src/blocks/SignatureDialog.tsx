import { useForm, Controller } from 'react-hook-form';
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
  Label,
  Card,
  CardContent,
  Input,
} from '@ds3/react';
import Signature from "./Signature.tsx";
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import type { SignatureBlock } from './BlockNoteSchema';
import React from "react";
import { Signature as SignatureIcon } from 'lucide-react-native';
import { useAccount } from 'wagmi';
import { View } from 'react-native';
import AddressAvatar from "../web3/AddressAvatar.tsx";
import { isAddress } from 'viem';

interface SignatureDialogProps {
  children?: React.ReactNode;
  block: SignatureBlock;
  editor: any; //typeof schema.BlockNoteEditor;
}

export type FormData = {
  name: string,
  address: string,
};

const SignatureDialog: React.FC<SignatureDialogProps> = (props: SignatureDialogProps) => {
  const { address: walletAddress } = useAccount();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      address: walletAddress || ''
    }
  });

  const {
    reset,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = form;

  const editorMode = useBlockNoteStore((state) => state.editorMode);

  const isSigningDisabled = !(editorMode === BlockNoteMode.SIGNATURE || editorMode === BlockNoteMode.SIMULATION);

  const onSubmit = (data: FormData) => {
    props.editor.updateBlock(props.block, {
      props: { name: data.name, address: data.address},
    })
    reset();
  };

  const {
    name,
    address
  } = watch();

  return (
    <Dialog className="w-full">
      <DialogTrigger className="w-full" asChild disabled={isSigningDisabled}>
        <Button variant='dashed' color="primary">
          <Button.Icon icon={SignatureIcon}/>
          <Button.Text>Sign Here</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Adopt Your Signature</DialogTitle>
          <DialogDescription>
            <View className="flex flex-col gap-4">
              <Controller
                control={control}
                name="name"
                rules={{
                  required: 'Name is required'
                }}
                render={({ field }) => (
                  <InputField
                    label="Full Name"
                    placeholder="Your name"
                    error={errors?.name?.message as string}
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                rules={{
                  required: 'Address is required',
                  validate: (value) => isAddress(value) || 'Invalid Ethereum address'
                }}
                render={({ field: { value, ...otherProps } }) => (
                  <InputField
                    label="Address"
                    placeholder="Your address"
                    error={errors?.address?.message as string}
                    value={value}
                    {...otherProps}
                  >
                    {isAddress(value) &&
                      <AddressAvatar address={value} className="w-6 h-6" />
                    }
                    <Input.Field />
                  </InputField>
                )}
              />

              <Label><Text>Preview</Text></Label>

              <Card className='w-full'>
                <CardContent className='p-4'>
                  {name || address ?
                    <Signature name={name} address={address} /> :
                    <Text className="text-center">Complete information to generate signature preview.</Text>
                  }

                </CardContent>
              </Card>
            </View>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost'>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>

          {isValid ?
            <DialogClose asChild>
              <Button variant="soft" color="primary" onPress={handleSubmit(onSubmit)}>
                <Text>Adopt Signature</Text>
              </Button>
            </DialogClose> :
            <Button variant="soft" color="primary" onPress={handleSubmit(onSubmit)}>
              <Text>Adopt Signature</Text>
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default SignatureDialog;