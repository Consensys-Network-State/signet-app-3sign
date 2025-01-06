import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { mainnet, sepolia, polygon, optimism, arbitrum, linea } from 'viem/chains';
import {
  Button,
  Text,
  InputField,
  RadioGroupField,
  RadioGroupFieldItem,
  SelectField,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
  utils,
  SwitchField,
} from '@ds3/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const chains = [mainnet, sepolia, polygon, optimism, arbitrum, linea];

const SablierForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // select stuff
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const onSubmit = (data) => {
    Alert.alert("Form Data", JSON.stringify(data));
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
              error={errors?.contact?.message as string}
              value={value ? { label: value?.label ?? '', value: value?.label ?? '' } : undefined}
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

              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} label={chain.name} value={chain.id}>
                      <Text>{chain.name}</Text>
                    </SelectItem>
                  ))}
                </SelectGroup>
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
            <InputField
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
          name="firstPaymnet"
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
      <Button onPress={handleSubmit(onSubmit)}>
        <Text>Submit</Text>
      </Button>
    </div>
  );
};

export default SablierForm;
