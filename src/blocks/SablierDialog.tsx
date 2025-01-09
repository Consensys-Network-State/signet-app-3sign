import { View } from 'react-native';
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
  Card,
  CardContent,
} from '@ds3/react';
import SablierForm, { FormData } from "./SablierForm.tsx";
import { useForm } from 'react-hook-form';
import SablierIcon from "../assets/sablier.svg?react";
import { ReactNode } from "react";
import {
  Block,
  BlockNoteEditor,
} from '@blocknote/core';

interface SablierDialogProps {
  children?: ReactNode;
  editor: BlockNoteEditor;
  block: Block;
}

const SablierDialog: React.FC<SablierDialogProps> = (props) => {
  const { children } = props;
  const form = useForm<FormData>({
    defaultValues: {
      chain: { value: props.block.props.chain, label: props.block.props.chain },
      token: props.block.props.token,
      amount: props.block.props.amount,
      numMonths: props.block.props.duration,
    }
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormData) => {
    console.log("Sablier Form Data", JSON.stringify(data, null, 2));
    props.editor.updateBlock(props.block, {
      props: { 
        chain: data.chain.value,
        token: data.token,
        amount: data.amount,
        duration: data.numMonths,
      },
    })
  };

  return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className='w-[800px] max-w-[800px]'>
          <DialogHeader>
            <DialogTitle>Configure Contract</DialogTitle>
            <DialogDescription>
              <Card className="w-full mb-4">
                <CardContent className="flex flex-row items-center p-4 gap-4">
                  <SablierIcon className="w-8 h-8" />

                  <View>
                    <Text className="font-bold">Sablier Stream</Text>
                    <Text className="text-sm text-muted-foreground">Monthly Unlocks</Text>
                  </View>

                </CardContent>
              </Card>
              <SablierForm form={form} />
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
                <Button onPress={handleSubmit(onSubmit)}>
                  <Text>Save</Text>
                </Button>
              </DialogClose> :
              <Button onPress={handleSubmit(onSubmit)}>
                <Text>Save</Text>
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

  )
};

export default SablierDialog;