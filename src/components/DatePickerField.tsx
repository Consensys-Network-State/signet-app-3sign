import {
  ElementRef,
  forwardRef,
  useId,
  useRef,
  ComponentRef,
  useImperativeHandle
} from 'react';
import { View } from 'react-native';
import DatePicker from "./DatePicker.tsx";
import { Text, Label } from '@ds3/react';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
      [inputRef.current]
    );

    const componentId = useId();
    const fieldId = `${componentId}-field`;
    const fieldErrorId = `${componentId}-field-error`;
    const fieldDescriptionId = `${componentId}-field-description`;

    return (
      <View>
        {label && (
          <Label nativeID={fieldId}>
            {label}
          </Label>
        )}

        <DatePicker
          ref={inputRef}
          aria-labelledby={fieldId}
          aria-describedby={!error ? fieldDescriptionId : fieldErrorId}
          aria-invalid={!!error}
          {...otherProps}
        />

        {description && !error && (
          <Animated.View entering={FadeInDown}>
            <Text nativeID={fieldDescriptionId}>
              {description}
            </Text>
          </Animated.View>
        )}

        {error && (
          <Animated.View entering={FadeInDown}>
            <Text className="text-destructive" nativeID={fieldErrorId}>
              {error}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }
);

DatePickerField.displayName = 'DatePickerField';

export { DatePickerField };
