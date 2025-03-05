import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Text,
  InputField,
  RadioGroupField,
  SelectField,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  cn,
  Field,
  SwitchField,
  Input,
} from '@ds3/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerField } from '../components/DatePickerField';
import { Dayjs } from 'dayjs';
import { supportedChains as chains } from '../utils/chainUtils';
import ChainAvatar from "../web3/ChainAvatar.tsx";
import { View } from 'react-native';
import AddressAvatar from "../web3/AddressAvatar.tsx";
import { isAddress } from 'viem';

export type FormData = {
  chain: { value: string; label: string } | null;
  token: string;
  amount: string;
  recipient: string;
  startDate: Dayjs | undefined;
  duration: string;
  firstPayment: 'atStart' | 'endFirstMonth';
  transferability: boolean;
};

interface FormProps {
  form: UseFormReturn<FormData>;
  fields?: Array<keyof FormData>;
}

const SablierForm: React.FC<FormProps> = ({ form, fields }) => {
  const {
    control,
    formState: { errors },
  } = form;

  // select stuff
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const renderField = (fieldName: keyof FormData) => {
    switch (fieldName) {
      case 'chain':
        return (
          <Controller
            control={control}
            name="chain"
            rules={{
              required: 'Chain is required',
            }}
            render={({ field: { onChange, value, ...otherProps } }) => (
              <SelectField
                error={errors?.chain?.message as string}
                value={value ? { label: value?.label ?? '', value: value?.value ?? '' } : undefined}
                onValueChange={onChange}
                className='flex-col gap-3'
                label="Chain"
                {...otherProps}
              >
                <SelectTrigger>
                  <SelectValue
                    className={cn(
                      'text-sm native:text-lg',
                      value ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    placeholder='Select a chain'
                  />
                </SelectTrigger>

                <SelectContent insets={contentInsets} className="p-0">
                  {chains.map((chain) => (
                    <SelectItem
                      key={chain.id}
                      // @ts-expect-error Select item value should support ReactNode
                      label={
                        <View className="flex flex-row items-center">
                          <ChainAvatar className="mr-2" chainId={chain.id}/>
                          <Text>{chain.name}</Text>
                        </View>
                      }
                      // @ts-expect-error SelectItem value should also support numbers not only strings
                      value={chain.id}
                    />
                  ))}
                </SelectContent>
              </SelectField>
            )}
          />
        );
      case 'token':
        return (
          <Controller
            control={control}
            name="token"
            rules={{
              required: 'Token is required'
            }}
            render={({ field }) => (
              <InputField
                label="Token"
                placeholder="Input token address"
                error={errors?.token?.message as string}
                {...field}
              />
            )}
          />
        );
      case 'amount':
        return (
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'Amount is required'
            }}
            render={({ field }) => (
              <InputField
                label="Amount"
                placeholder="Input token amount"
                error={errors?.amount?.message as string}
                keyboardType="numeric"
                {...field}
              />
            )}
          />
        );
      case 'recipient':
        return (
          <Controller
            control={control}
            name="recipient"
            rules={{
              required: 'Recipient is required',
              validate: (value) => isAddress(value) || 'Invalid Ethereum address'
            }}
            render={({ field }) => (
              <InputField
                label="Recipient"
                placeholder="Input address"
                error={errors?.recipient?.message as string}
                {...field}
              >
                {isAddress(field.value) &&
                  <AddressAvatar address={field.value} className="w-6 h-6" />
                }
                <Input.Field />
              </InputField>
            )}
          />
        );
      case 'startDate':
        return (
          <Controller
            control={control}
            name="startDate"
            rules={{
              required: 'Start date is required',
            }}
            render={({field}) => (
              <DatePickerField
                label="Start Date"
                placeholder="Select date"
                error={errors?.startDate?.message as string}
                {...field}
              />
            )}
          />
        );
      case 'duration':
        return (
          <Controller
            control={control}
            name="duration"
            rules={{
              required: 'Number of months is required',
            }}
            render={({field}) => (
              <InputField
                label="Number of Months"
                placeholder="Number of months"
                error={errors?.duration?.message as string}
                {...field}
              />
            )}
          />
        );
      case 'firstPayment':
        return (
          <Controller
            control={control}
            name="firstPayment"
            defaultValue="atStart"
            rules={{
              required: 'Mode is required',
            }}
            render={({field: {onChange, value, ...otherProps}}) => (
              <RadioGroupField
                error={errors?.firstPayment?.message as string}
                value={value}
                onValueChange={onChange}
                label="First Payment"
                {...otherProps}
              >
                <Field.Row>
                  <RadioGroupField.Item label='At Start' value='atStart' onLabelPress={() => onChange('atStart')}/>
                  <RadioGroupField.Item label='End of First Month' value='endFirstMonth' onLabelPress={() => onChange('endFirstMonth')}/>
                </Field.Row>
              </RadioGroupField>
            )}
          />
        );
      case 'transferability':
        return (
          <Controller
            control={control}
            name="transferability"
            defaultValue={false}
            render={({field: {onChange, value, ...otherProps}}) => (
              <SwitchField
                error={errors?.transferability?.message as string}
                onCheckedChange={onChange}
                checked={value}
                label="Transferability"
                {...otherProps}
              />
            )}
          />
        );
    }
  };

  return (
    <View className="flex flex-col gap-4">
      {fields?.map((fieldName) => (
        <View key={fieldName}>
          {renderField(fieldName)}
        </View>
      ))}
    </View>
  );
};

export default SablierForm;
