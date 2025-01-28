import {
  ElementRef,
  forwardRef,
  useRef,
  ComponentRef,
  useImperativeHandle
} from 'react';
import DatePicker from "./DatePicker";
import { Field } from "@ds3/react";
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
}

const DatePickerField = forwardRef<ElementRef<typeof DatePicker>, DatePickerProps>(
  (props, ref) => {
    const {
      error,
      label,
      description,
      ...otherProps
    } = props;

    const inputRef = useRef<ComponentRef<typeof DatePicker>>(null);

    useImperativeHandle(
      ref,
      () => {
        if (!inputRef.current) {
          return {} as ComponentRef<typeof DatePicker>;
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
            <Field.Label>
              {label}
            </Field.Label>
          </Field.Row>
        )}

        <DatePicker
          ref={inputRef}
          {...otherProps}
        />

        {(description || error) && (
          <Field.Description>
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