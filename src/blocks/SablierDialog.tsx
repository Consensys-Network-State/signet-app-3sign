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
  IconButton
} from '@ds3/react';
import SablierForm, { FormData } from "./SablierForm.tsx";
import { useForm } from 'react-hook-form';
import SablierIcon from "../assets/sablier.svg?react";
import { FC } from "react";
import type { SablierBlock } from './BlockNoteSchema';
import { Pencil } from "lucide-react-native";

interface SablierDialogProps {
  disabled?: boolean
  block: SablierBlock;
  editor: any;
}

const SablierDialog: FC<SablierDialogProps> = (props) => {
  const { disabled = false } = props;
  const form = useForm<FormData>({
    defaultValues: {
      chain: { value: props.block.props.chain, label: props.block.props.chain },
      token: props.block.props.token,
      amount: props.block.props.amount,
      recipient: props.block.props.recipient,
      startDate: props.block.props.startDate,
      duration: props.block.props.duration,
      firstPayment: props.block.props.firstPayment,
      transferability: props.block.props.transferability
    }
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormData) => {
    props.editor.updateBlock(props.block, {
      props: {
        chain: (data.chain!).value,
        token: data.token,
        amount: data.amount,
        recipient: data.recipient,
        startDate: data.startDate?.format('MMM D, YYYY'),
        duration: data.duration,
        firstPayment: data.firstPayment,
        transferability: data.transferability,
      },
    })
  };

  return (
      <Dialog>
        <DialogTrigger asChild disabled={disabled}>
          <IconButton variant="ghost" size="sm" icon={Pencil} />
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
                <Button variant="soft" color="primary" onPress={handleSubmit(onSubmit)}>
                  <Text>Save</Text>
                </Button>
              </DialogClose> :
              <Button variant="soft" color="primary" onPress={handleSubmit(onSubmit)}>
                <Text>Save</Text>
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

  )
};

export default SablierDialog;