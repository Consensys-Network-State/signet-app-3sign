import { createReactInlineContentSpec } from "@blocknote/react";
import { View } from 'react-native';
import { Text, Icon, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, InputField, Input, SwitchField } from '@ds3/react';
import { Wallet } from 'lucide-react-native';
import { isAddress } from 'viem';
import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressAvatar from "../web3/AddressAvatar";
import Address from "../web3/Address";

export const WalletAddressInline = createReactInlineContentSpec(
  {
    type: "walletAddress",
    propSchema: {
      address: {
        default: "",
      },
      useEns: {
        default: true,
      },
      truncate: {
        default: true,
      }
    },
    content: "none",
  } as const,
  {
    render: (props) => {
      const [isOpen, setIsOpen] = React.useState(false);
      const { control } = useForm({
        defaultValues: {
          address: props.inlineContent.props.address,
          useEns: props.inlineContent.props.useEns,
          truncate: props.inlineContent.props.truncate
        },
        mode: 'onChange' // Enable validation on change
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

      const address = props.inlineContent.props.address;
      const isValidAddress = isAddress(address);

      return (
        <span className="inline-block">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger>
              <span className="inline-flex items-center gap-1 bg-neutral-2 px-1.5 py-0.5 rounded text-sm cursor-pointer hover:bg-neutral-3">
                {isValidAddress ? (
                  <>
                    <AddressAvatar 
                      address={address as `0x${string}`} 
                      className="w-4 h-4"
                      ens={props.inlineContent.props.useEns}
                    />
                    <Address 
                      address={address as `0x${string}`}
                      ens={props.inlineContent.props.useEns}
                      truncate={props.inlineContent.props.truncate}
                    />
                  </>
                ) : (
                  <>
                    <Icon icon={Wallet} className="w-4 h-4" />
                    <Text>Insert Address</Text>
                  </>
                )}
              </span>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent insets={contentInsets} className="w-72">
              <DropdownMenuLabel>Enter Ethereum Address</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <View className="p-2 flex flex-col gap-4">
                <Controller
                  control={control}
                  name="address"
                  rules={{
                    validate: (value) => !value || isAddress(value) || 'Invalid Ethereum address'
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputField
                      label="Address"
                      placeholder="0x..."
                      error={error?.message}
                      value={field.value}
                      onChangeText={(value) => {
                        field.onChange(value);
                        if (!value || isAddress(value)) {
                          updateProps('address', value);
                        }
                      }}
                    >
                      {isAddress(field.value) &&
                        <AddressAvatar 
                          address={field.value as `0x${string}`} 
                          className="w-6 h-6"
                          ens={props.inlineContent.props.useEns}
                        />
                      }
                      <Input.Field />
                    </InputField>
                  )}
                />

                <Controller
                  control={control}
                  name="useEns"
                  render={({ field }) => (
                    <SwitchField
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        updateProps('useEns', value);
                      }}
                      label="Use ENS"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="truncate"
                  render={({ field }) => (
                    <SwitchField
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        updateProps('truncate', value);
                      }}
                      label="Truncate Address"
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