import { View } from 'react-native';
import {
  Text,
  Button,
  Card,
  CardContent,
} from '@ds3/react';
import SablierForm, { FormData } from "./SablierForm";
import { useForm } from 'react-hook-form';
import SablierIcon from "../assets/sablier.svg?react";
import { FC } from "react";
import type { SablierBlock } from './BlockNoteSchema';
import { useSearchParams } from 'react-router';

interface SablierDrawerProps {
  block: SablierBlock;
  editor: any;
}

const SablierDrawer: FC<SablierDrawerProps> = (props) => {
  const [, setSearchParams] = useSearchParams();
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
    });
    setSearchParams({});
  };

  const handleCancel = () => {
    setSearchParams({});
  };

  return (
    <View className="flex flex-col h-full">
      <View className="flex-1">
        <Text className="text-lg font-semibold mb-4">Configure Contract</Text>
        
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
      </View>

      <View className="flex flex-row justify-end gap-2 mt-4 pt-4 border-t border-neutral-6">
        <Button variant="ghost" onPress={handleCancel}>
          <Text>Cancel</Text>
        </Button>

        <Button
          variant="soft"
          color="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
        >
          <Text>Save</Text>
        </Button>
      </View>
    </View>
  );
};

export default SablierDrawer; 