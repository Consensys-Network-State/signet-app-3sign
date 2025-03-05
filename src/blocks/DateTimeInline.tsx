import { createReactInlineContentSpec } from "@blocknote/react";
import { Text, Icon } from "@ds3/react";
import { View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SwitchField,
} from '@ds3/react';
import { DatePickerField } from '../components/DatePickerField';

export const DateTimeInline = createReactInlineContentSpec(
  {
    type: "dateTime",
    propSchema: {
      date: {
        default: "",  // Will store date as ISO string
      },
      showTime: {
        default: false,
      }
    },
    content: "none",
  } as const,
  {
    render: (props) => {
      const [isOpen, setIsOpen] = React.useState(false);
      const { control } = useForm({
        defaultValues: {
          date: props.inlineContent.props.date ? dayjs(props.inlineContent.props.date) : undefined,
          showTime: props.inlineContent.props.showTime
        }
      });

      const insets = useSafeAreaInsets();
      const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
      };

      const updateProps = (field: keyof typeof props.inlineContent.props, value: any) => {
        props.updateInlineContent({
          ...props.inlineContent,
          props: {
            ...props.inlineContent.props,
            [field]: value
          }
        });
      };

      const date = props.inlineContent.props.date;
      const formattedDate = date ? 
        dayjs(date).format(props.inlineContent.props.showTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY') 
        : '';

      return (
        <span className="inline-block">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger>
              <span className="inline-flex items-center gap-1 bg-neutral-2 px-1.5 py-0.5 rounded text-sm cursor-pointer hover:bg-neutral-3">
                {formattedDate ? (
                  <>
                    <Icon icon={Calendar} className="w-4 h-4" />
                    <Text>{formattedDate}</Text>
                  </>
                ) : (
                  <>
                    <Icon icon={Calendar} className="w-4 h-4" />
                    <Text>Insert Date</Text>
                  </>
                )}
              </span>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent insets={contentInsets} className="w-72">
              <DropdownMenuLabel>Select Date & Time</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <View className="p-2 flex flex-col gap-4">
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePickerField
                      label="Date"
                      placeholder="Select date"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        updateProps('date', value.toISOString());
                      }}
                      showTime={props.inlineContent.props.showTime}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="showTime"
                  render={({ field }) => (
                    <SwitchField
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        updateProps('showTime', value);
                      }}
                      label="Show Time"
                    />
                  )}
                />
              </View>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      );
    },
  }
); 