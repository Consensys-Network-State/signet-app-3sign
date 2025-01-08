import { FC } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Text,
  InputField,
  RadioGroupField,
  RadioGroupFieldItem,
  SelectField,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  utils,
  SwitchField,
} from '@ds3/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerField } from '../components/DatePickerField';
import { mainnet, sepolia, polygon, optimism, arbitrum, linea } from 'viem/chains';
import { Dayjs } from 'dayjs';

const chains = [mainnet, sepolia, polygon, optimism, arbitrum, linea];

export type FormData = {
  chain: { value: string; label: string } | null;
  token: string;
  amount: string;
  recipient: string;
  startDate: Dayjs | undefined;
  numMonths: string;
  firstPayment: 'atStart' | 'endFirstMonth';
  transferability: boolean;
};

interface FormProps {
  form: UseFormReturn<FormData>; // React Hook Form's `useForm` return type
}

const SablierForm: FC<FormProps> = ({ form }) => {
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
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
                  className={utils.cn(
                    'text-sm native:text-lg',
                    value ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  placeholder='Select a verified email'
                />
              </SelectTrigger>

              <SelectContent insets={contentInsets} className="p-0">
                {chains.map((chain) => (
                  // @ts-expect-error SelectItem value should also support numbers not only strings
                  <SelectItem key={chain.id} label={chain.name} value={chain.id}>
                    <Text>{chain.name}</Text>
                  </SelectItem>
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
              label="Token"
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
          }}
          render={({ field }) => (
            <InputField
              label="Recipient"
              placeholder="Input address"
              error={errors?.recipient?.message as string}
              {...field}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
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
        <Controller
          control={control}
          name="numMonths"
          rules={{
            required: 'Number of months is required',
          }}
          render={({field}) => (
            <InputField
              label="Number of Months"
              placeholder="Number of months"
              error={errors?.numMonths?.message as string}
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
              className='flex-col gap-3'
              label="First Payment"
              {...otherProps}
            >
              <RadioGroupFieldItem label='At Start' value='atStart' onLabelPress={() => onChange('atStart')}/>
              <RadioGroupFieldItem label='End of First Month' value='endFirstMonth' onLabelPress={() => onChange('endFirstMonth')}/>
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
      </div>
    </div>
  );
};

export default SablierForm;
