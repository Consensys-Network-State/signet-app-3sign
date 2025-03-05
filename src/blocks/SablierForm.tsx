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
import { LinkVariable } from '../components/LinkVariable.tsx';
import { 
  isVariableReference, 
  getVariableNameFromReference, 
  toVariableReference,
  resolveVariableReference
} from '../utils/variableUtils';

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
}

const toCamelCase = (str: string): string => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

const SablierForm: React.FC<FormProps> = ({ form }) => {
  const {
    control,
    formState: { errors },
    watch,
  } = form;

  const { variables, addVariable } = useVariablesStore();

  // Helper function to handle variable linking for any field
  const handleLinkVariable = (label: string, type: VariableType, value: any) => {
    const name = toCamelCase(label);
    addVariable(name, type, value);
    
    // Update the form field to use the variable reference
    const fieldName = label.toLowerCase().replace(/\s+/g, '') as keyof FormData;
    form.setValue(fieldName, toVariableReference(name));
  };

  // Function to check if a field is linked to a variable
  const isFieldLinked = (value: any): boolean => {
    return typeof value === 'string' && isVariableReference(value);
  };

  // Function to resolve value from variable if needed
  const resolveValue = (value: any): any => {
    if (typeof value === 'string' && isVariableReference(value)) {
      return resolveVariableReference(value, variables);
    }
    return value;
  };

  // Watch all form values
  const formValues = watch();

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
            value={value}
            onValueChange={onChange}
            className='flex-col gap-3'
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Chain</Text>
                <LinkVariable onClick={() => handleLinkVariable('Chain', 'number', value?.value)} />
              </View>
            }
            description={isFieldLinked(value?.value) ? `This field is linked to '${getVariableNameFromReference(value?.value)}' variable` : undefined}
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
                  label={
                    <View className="flex flex-row items-center">
                      <ChainAvatar className="mr-2" chainId={chain.id}/>
                      <Text>{chain.name}</Text>
                    </View>
                  }
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
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Token</Text>
                <LinkVariable onClick={() => handleLinkVariable('Token', 'address', field.value)} />
              </View>
            }
            description={isFieldLinked(field.value) ? `This field is linked to '${getVariableNameFromReference(field.value)}' variable` : undefined}
            placeholder="Input token address"
            error={errors?.token?.message as string}
            value={resolveValue(field.value)}
            onChangeText={field.onChange}
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
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Amount</Text>
                <LinkVariable onClick={() => handleLinkVariable('Amount', 'number', field.value)} />
              </View>
            }
            description={isFieldLinked(field.value) ? `This field is linked to '${getVariableNameFromReference(field.value)}' variable` : undefined}
            placeholder="Input token amount"
            error={errors?.amount?.message as string}
            value={resolveValue(field.value)}
            onChangeText={field.onChange}
            keyboardType="numeric"
          />
        )}
      />

      <Controller
        control={control}
        name="recipient"
        rules={{
          required: 'Recipient is required',
          validate: (value) => {
            const resolvedValue = resolveValue(value);
            return isAddress(resolvedValue) || 'Invalid Ethereum address';
          }
        }}
        render={({ field }) => {
          const resolvedValue = resolveValue(field.value);
          
          return (
            <InputField
              label={
                <View className="flex flex-row items-center w-full">
                  <Text className="mr-auto">Recipient</Text>
                  <LinkVariable onClick={() => handleLinkVariable('Recipient', 'address', resolvedValue)} />
                </View>
              }
              description={isFieldLinked(field.value) ? `This field is linked to '${getVariableNameFromReference(field.value)}' variable` : undefined}
              placeholder="Input address"
              error={errors?.recipient?.message as string}
              value={resolvedValue}
              onChangeText={(text) => field.onChange(text)}
            >
              {isAddress(resolvedValue) &&
                <AddressAvatar address={resolvedValue} className="w-6 h-6" />
              }
              <Input.Field />
            </InputField>
          );
        }}
      />

      <Controller
        control={control}
        name="startDate"
        rules={{
          required: 'Start date is required',
        }}
        render={({field}) => (
          <DatePickerField
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Start Date</Text>
                <LinkVariable onClick={() => handleLinkVariable('StartDate', 'date', field.value)} />
              </View>
            }
            description={isFieldLinked(field.value) ? `This field is linked to '${getVariableNameFromReference(field.value)}' variable` : undefined}
            placeholder="Select date"
            error={errors?.startDate?.message as string}
            value={resolveValue(field.value)}
            onChange={field.onChange}
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
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Number of Months</Text>
                <LinkVariable onClick={() => handleLinkVariable('Duration', 'number', field.value)} />
              </View>
            }
            description={isFieldLinked(field.value) ? `This field is linked to '${getVariableNameFromReference(field.value)}' variable` : undefined}
            placeholder="Number of months"
            error={errors?.duration?.message as string}
            value={resolveValue(field.value)}
            onChangeText={field.onChange}
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
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">First Payment</Text>
                <LinkVariable onClick={() => handleLinkVariable('FirstPayment', 'text', value)} />
              </View>
            }
            description={isFieldLinked(value) ? `This field is linked to '${getVariableNameFromReference(value)}' variable` : undefined}
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
            label={
              <View className="flex flex-row items-center w-full">
                <Text className="mr-auto">Transferability</Text>
                <LinkVariable onClick={() => handleLinkVariable('Transferability', 'boolean', value)} />
              </View>
            }
            description={isFieldLinked(value) ? `This field is linked to '${getVariableNameFromReference(value)}' variable` : undefined}
            {...otherProps}
          />
        )}
      />
    </View>
  );
};

export default SablierForm;
