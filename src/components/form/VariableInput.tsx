import * as React from 'react';
import { TextInput } from 'react-native';
import { InputField, Input } from '@ds3/react';
import { isAddress } from 'viem';
import AddressAvatar from "../../web3/AddressAvatar";
import { DatePickerField } from '../DatePickerField';
import dayjs from 'dayjs';
import DocumentSignatureDialog from '../../blocks/DocumentSignatureDialog';
import { DocumentVariable } from '../../store/documentStore';

// Create a shared validation function
export const createValidationRules = (variable: DocumentVariable) => {
  const rules: Record<string, any> = {
    required: variable.validation?.required ? `${variable.name} is required` : false,
  };

  rules.validate = (value: string) => {
    if (!value) {
      return rules.required || true;
    }

    if (variable.type === 'address' && !isAddress(value)) {
      return 'Invalid Ethereum address';
    }

    if (variable.type === 'dateTime' && !dayjs(value).isValid()) {
      return 'Invalid date';
    }

    const { validation } = variable;
    if (!validation) return true;

    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return `Invalid ${variable.name.toLowerCase()} format`;
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `${variable.name} must be at least ${validation.minLength} characters`;
    }

    if (validation.min) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < validation.min) {
        return `${variable.name} must be at least ${validation.min}`;
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      return `${variable.name} must be one of: ${validation.enum.join(', ')}`;
    }

    return true;
  };

  return rules;
};

export interface VariableInputProps {
  name: string;
  variable: DocumentVariable;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: { message?: string } | string | undefined;
  disabled?: boolean;
  className?: string;
}

const VariableInput: React.FC<VariableInputProps> = ({
  name,
  variable,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = "w-[300px]"
}) => {
  const inputRef = React.useRef<TextInput>(null);
  const [localValue, setLocalValue] = React.useState(value);
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateValue = React.useCallback((newValue: string) => {
    const rules = createValidationRules(variable);
    const result = rules.validate(newValue);
    return result === true ? undefined : result;
  }, [variable]);

  const handleChange = React.useCallback((newValue: string) => {
    setLocalValue(newValue);
    const validationError = validateValue(newValue);
    setLocalError(validationError);
    onChange(newValue);
  }, [onChange, validateValue]);

  const errorMessage = localError || (typeof error === 'string' ? error : error?.message);

  if (variable.type === 'address') {
    return (
      <InputField
        // @ts-ignore - using RN TextInput interface
        ref={inputRef}
        value={localValue}
        onChangeText={handleChange}
        variant="underline"
        placeholder={variable.name}
        error={errorMessage}
        className={className}
        disabled={disabled}
      >
        {isAddress(localValue) && (
          <AddressAvatar address={localValue} className="w-6 h-6" />
        )}
        <Input.Field />
      </InputField>
    );
  }

  if (variable.type === 'dateTime') {
    return (
      <DatePickerField
        value={localValue ? dayjs(localValue) : undefined}
        onChange={(date) => handleChange(date ? date.format() : '')}
        placeholder="Select date"
        error={errorMessage}
        className={className}
        disabled={disabled}
      />
    );
  }

  if (variable.type === 'signature') {
    return (
      <DocumentSignatureDialog
        name={variable.name}
        value={value}
        onSignatureAdopted={onChange}
        disabled={disabled}
      />
    );
  }

  return (
    <InputField
      // @ts-ignore - using RN TextInput interface
      ref={inputRef}
      value={localValue}
      onChangeText={handleChange}
      variant="underline"
      placeholder={variable.name}
      error={errorMessage}
      className={className}
      disabled={disabled}
    />
  );
};

export default React.memo(VariableInput, (prevProps, nextProps) => {
  const prevError = typeof prevProps.error === 'string' ? prevProps.error : prevProps.error?.message;
  const nextError = typeof nextProps.error === 'string' ? nextProps.error : nextProps.error?.message;
  
  return (
    prevProps.value === nextProps.value &&
    prevError === nextError &&
    prevProps.disabled === nextProps.disabled
  );
}); 