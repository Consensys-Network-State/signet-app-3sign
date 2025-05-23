import * as React from 'react';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import dayjs, { Dayjs } from 'dayjs';
import { Platform, LayoutChangeEvent } from 'react-native';
import {
  Text,
  Select,
  SelectTrigger,
  SelectContent,
  Icon,
  useThemeContext,
} from "@consensys/ui";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootProps as SelectProps } from '@rn-primitives/select';
import { COLOR_MODES } from "@consensys/ui-theme";
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

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
  disabled?: boolean;
}

const DatePicker = React.forwardRef<React.ElementRef<typeof SelectTrigger>, DatePickerProps>((props, ref) => {
  const {
    value,
    onChange,
    placeholder,
    disabled,
    ...otherProps
  } = props;

  const [triggerWidth, setTriggerWidth] = React.useState(0);
  const insets = useSafeAreaInsets();
  const triggerRef = React.useRef<React.ElementRef<typeof SelectTrigger>>(null);
  const { mode } = useThemeContext();

  const textColor = mode === COLOR_MODES.Dark ? '#FFFFFF' : '#000000';
  const bgColor = mode === COLOR_MODES.Dark ? '#222' : '#FFF'
  const style = {
    headerContainerStyle: {
      backgroundColor: bgColor,
      borderRadius: '4px'
    },
    // headerTextContainerStyle?: ViewStyle;
    headerTextStyle: {
      color: textColor
    },
    // headerButtonStyle?: ViewStyle;
    dayContainerStyle: {
      backgroundColor: bgColor,
    },
    // todayContainerStyle: {
    //   backgroundColor: '#200',
    // },
    todayTextStyle: {
      color: textColor
    },
    monthContainerStyle: {
      backgroundColor: bgColor,
    },
    yearContainerStyle: {
      backgroundColor: bgColor,
    },
    // weekDaysContainerStyle?: ViewStyle;
    weekDaysTextStyle: {
      color: textColor
    },
    calendarTextStyle: {
      color: textColor
    },
    selectedTextStyle: {
      color: textColor
    },
    // selectedItemColor: {
    //   backGroundColor: '#000000',
    // },
    // timePickerContainerStyle?: ViewStyle;
    timePickerTextStyle: {
      color: textColor
    },
    // timePickerIndicatorStyle?: ViewStyle;
  }

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
      <SelectTrigger ref={triggerRef} onLayout={handleTriggerLayout} disabled={disabled}>
        {value ?
          <Text className="text-sm">{value.format('MMMM D, YYYY')}</Text> :
          <Text className="text-muted-foreground text-sm">{placeholder || "Select a date"}</Text>
        }
      </SelectTrigger>
      <SelectContent insets={contentInsets} style={{ width: triggerWidth, backgroundColor: mode === COLOR_MODES.Dark ? '#353535' : '#FFF' }} className={`p-0 border-none`} >
        <DateTimePicker
          mode="single"
          {...style}
          date={value || dayjs()}
          onChange={onSelectDate}
          buttonNextIcon={<Icon icon={ChevronRight} />}
          buttonPrevIcon={<Icon icon={ChevronLeft} />}
        />
      </SelectContent>
    </Select>
  );
});

export default DatePicker;