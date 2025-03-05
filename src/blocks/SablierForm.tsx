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
import { useVariablesStore } from '../store/variablesStore';
import { resolveVariableReference, isVariableReference } from '../utils/variableUtils';
import { LinkVariable } from '../components/LinkVariable.tsx';

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
  form: UseFormReturn<FormData>; // React Hook Form's `useForm` return type
}

const FormLabel: React.FC<{ label: string, onClick: () => void }> = ({ label, onClick }) => {
  return (
    <View className="flex flex-row items-center w-full">
      <Text className="mr-auto">{label}</Text>
      <LinkVariable onClick={onClick} />
    </View>
  );
};

const SablierForm: React.FC<FormProps> = ({ form }) => {
  const {
    control,
    formState: { errors },
  } = form;

  const { variables } = useVariablesStore();
  
  // Transform the form values for display
  const transformValueForDisplay = (value: any) => {
    if (typeof value === 'string' && isVariableReference(value)) {
      return resolveVariableReference(value, variables);
    }
    return value;
  };

  // select stuff
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <View className="flex flex-col gap-4">
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

      <Controller
        control={control}
        name="token"
        rules={{
          required: 'Token is required'
        }}
        render={({ field }) => (
          <InputField
            label={<FormLabel label="Token" onClick={() => {}} />}
            placeholder="Input token address"
            error={errors?.token?.message as string}
            {...field}
          />
        )}
      />

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

      <Controller
        control={control}
        name="recipient"
        rules={{
          required: 'Recipient is required',
          validate: (value) => {
            const resolvedValue = transformValueForDisplay(value);
            return isAddress(resolvedValue) || 'Invalid Ethereum address';
          }
        }}
        render={({ field }) => (
          <InputField
            label={<FormLabel label="Recipient" onClick={() => {}} />}
            description="This field is linked to 'recipient' variable"
            placeholder="Input address"
            error={errors?.recipient?.message as string}
            value={transformValueForDisplay(field.value)}
            onChangeText={field.onChange}
          >
            {isAddress(transformValueForDisplay(field.value)) &&
              <AddressAvatar address={transformValueForDisplay(field.value)} className="w-6 h-6" />
            }
            <Input.Field />
          </InputField>
        )}
      />

      <Controller
        control={control}
        name="startDate"
        rules={{
          required: 'Start date is required',
        }}
        render={({field}) => (
          <DatePickerField
            label={<FormLabel label="Start Date" onClick={() => {}} />}
            placeholder="Select date"
            error={errors?.startDate?.message as string}
            {...field}
          />
        )}
      />

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
    </View>
  );
};

export default SablierForm;
