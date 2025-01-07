import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { ComponentRef, useImperativeHandle, useState, forwardRef, useRef, ElementRef } from 'react';
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

type SingleChange = { date: DateType };

interface DatePickerProps extends Omit<SelectProps, 'value'> {
  value?: Dayjs;
  onChange?: (date: Dayjs) => void;
  placeholder?: string;
}

const DatePicker = forwardRef<ElementRef<typeof SelectTrigger>, DatePickerProps>((props, ref) => {
  const {
    value,
    onChange,
    placeholder,
    ...otherProps
  } = props;

  const [triggerWidth, setTriggerWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const triggerRef = useRef<ElementRef<typeof SelectTrigger>>(null);

  useImperativeHandle(
    ref,
    () => {
      if (!triggerRef.current) {
        return {} as ComponentRef<typeof DatePicker>;
      }
      return triggerRef.current;
    },
    [triggerRef.current]
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
