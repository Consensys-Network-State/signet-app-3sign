import * as React from 'react';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { Platform, LayoutChangeEvent } from 'react-native';
import {
  Text,
  Select,
  SelectTrigger,
  SelectContent,
  Icons,
} from "@ds3/react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootProps as SelectProps } from '@rn-primitives/select';

// TODO: There's a weird issue where you get the error: React is not defined when using the DateTimePicker Component
//  from react-native-ui-datepicker. Setting window.React = React fixes it.
//  Should Investigate why this is required for the production environment
// Claudes Answer: The root cause is that the library probably assumes React is globally available
//  (common in React Native) but in a Vite production build, it's not. The dev server handles this differently than the production build.
window.React = React;

type SingleChange = { date: DateType };

interface DatePickerProps extends Omit<SelectProps, 'value'> {
  value?: Dayjs;
  onChange?: (date: Dayjs) => void;
  placeholder?: string;
}

const DatePicker = React.forwardRef<React.ElementRef<typeof SelectTrigger>, DatePickerProps>((props, ref) => {
  const {
    value,
    onChange,
    placeholder,
    ...otherProps
  } = props;

  const [triggerWidth, setTriggerWidth] = React.useState(0);
  const insets = useSafeAreaInsets();
  const triggerRef = React.useRef<React.ElementRef<typeof SelectTrigger>>(null);

  React.useImperativeHandle(
    ref,
    () => {
      if (!triggerRef.current) {
        return {} as React.ComponentRef<typeof DatePicker>;
      }
      return triggerRef.current;
    },
    []
  );

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const handleTriggerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTriggerWidth(width);
  };

  const onSelectDate = (params: SingleChange) => {
    if (params.date) {
      const parsedDate = dayjs(params.date);

      if (parsedDate.isValid()) {
        onChange?.(parsedDate);
      } else {
        console.error("Invalid date selected:", params.date);
      }
    }
    triggerRef.current?.close();
  };

  return (
    <Select {...otherProps}>
      <SelectTrigger ref={triggerRef} onLayout={handleTriggerLayout}>
        {value ?
          <Text className="text-sm">{value.format('MMMM D, YYYY')}</Text> :
          <Text className="text-muted-foreground text-sm">{placeholder || "Select a date"}</Text>
        }
      </SelectTrigger>
      <SelectContent insets={contentInsets} style={{ width: triggerWidth }} className="p-0">
        <DateTimePicker
          mode="single"
          date={value || dayjs()}
          onChange={onSelectDate}
          buttonNextIcon={<Icons.ChevronRight />}
          buttonPrevIcon={<Icons.ChevronLeft />}
        />
      </SelectContent>
    </Select>
  );
});

export default DatePicker;