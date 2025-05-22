import * as React from 'react';
import DatePicker from "./DatePicker";
import { Field, useField } from "@consensys/ui";
import { AlertCircle, Calendar } from 'lucide-react-native';
import { RootProps as SelectProps } from '@rn-primitives/select';
import { Dayjs } from 'dayjs';

interface DatePickerProps extends Omit<SelectProps, 'value'> {
  value?: Dayjs;
  onChange?: (date: Dayjs) => void;
  placeholder?: string;
  error?: string | undefined;
  label?: string;
  description?: string;
  children?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerField = React.forwardRef<React.ElementRef<typeof DatePicker>, DatePickerProps>(
  (props, ref) => {
    const {
      error,
      label,
      description,
      children,
      required,
      disabled,
      ...otherProps
    } = props;

    const { fieldId, descriptionId, ariaProps } = useField({
      error,
      required
    });

    const inputRef = React.useRef<React.ComponentRef<typeof DatePicker>>(null);

    React.useImperativeHandle(
      ref,
      () => {
        if (!inputRef.current) {
          return {} as React.ComponentRef<typeof DatePicker>;
        }
        return inputRef.current;
      },
      []
    );

    return (
      <Field color={error ? "error" : "neutral"}>
        {label && (
          <Field.Row>
            <Field.Icon icon={error ? AlertCircle : Calendar} />
            <Field.Label nativeID={fieldId}>
              {label}
            </Field.Label>
          </Field.Row>
        )}

        <DatePicker
          ref={inputRef}
          {...ariaProps}
          {...otherProps}
          disabled={disabled}
        >
          {children}
        </DatePicker>

        {(description || error) && (
          <Field.Description nativeID={descriptionId}>
            {error || description}
          </Field.Description>
        )}
      </Field>
    );
  }
);

DatePickerField.displayName = 'DatePickerField';

export { DatePickerField };
export type { DatePickerProps };