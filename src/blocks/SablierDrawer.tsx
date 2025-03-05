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
import { FC, useEffect } from "react";
import type { SablierBlock } from './BlockNoteSchema';
import dayjs from 'dayjs';
import { useDrawer } from '../hooks/useDrawer';
import * as React from 'react';
import { isVariableReference } from '../utils/variableUtils';

interface SablierDrawerProps {
  block: SablierBlock;
  editor: any;
}

const SablierDrawer: FC<SablierDrawerProps> = ({ block, editor }) => {
  const { closeDrawer } = useDrawer();

  const form = useForm<FormData>({
    defaultValues: {
      chain: { value: block.props.chain, label: block.props.chain },
      token: block.props.token,
      amount: block.props.amount,
      recipient: block.props.recipient,
      startDate: block.props.startDate ? dayjs(block.props.startDate, 'MMM D, YYYY') : undefined,
      duration: block.props.duration,
      firstPayment: block.props.firstPayment,
      transferability: block.props.transferability
    }
  });

  // Reset form when block changes
  useEffect(() => {
    form.reset({
      chain: { value: block.props.chain, label: block.props.chain },
      token: block.props.token,
      amount: block.props.amount,
      recipient: block.props.recipient,
      startDate: block.props.startDate ? dayjs(block.props.startDate, 'MMM D, YYYY') : undefined,
      duration: block.props.duration,
      firstPayment: block.props.firstPayment,
      transferability: block.props.transferability
    });
  }, [block.id]);

  // Watch for form changes and update block
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.chain?.value) {  // Only update if we have valid data
        editor.updateBlock(block, {
          props: {
            ...block.props,
            chain: parseInt(data.chain.value),
            token: data.token,
            amount: data.amount,
            recipient: isVariableReference(data.recipient) ? data.recipient : data.recipient,
            startDate: data.startDate?.format('MMM D, YYYY'),
            duration: parseInt(data.duration),
            firstPayment: data.firstPayment,
            transferability: data.transferability,
          },
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [block, editor, form]);

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
        <Button variant="ghost" onPress={closeDrawer}>
          <Text>Close</Text>
        </Button>
      </View>
    </View>
  );
};

export default SablierDrawer; 