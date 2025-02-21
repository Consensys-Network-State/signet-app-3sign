import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultProps,
  CustomBlockConfig,
  defaultInlineContentSpecs,
} from '@blocknote/core';
import { createReactBlockSpec, createReactInlineContentSpec } from "@blocknote/react";
import { Icons, Card, CardContent, CardTitle, CardHeader, Text, Icon } from "@ds3/react";
import SablierIcon from "../assets/sablier.svg?react";
import MonthlyIcon from "../assets/monthly.svg?react";
import LineaIcon from "../assets/linea.svg?react";
import TokenIcon from "../assets/token.svg?react";
import SablierDialog from "./SablierDialog.tsx";
import { supportedChains, getChainById } from "../utils/chainUtils";
import Signature from "./Signature.tsx";
import SignatureDialog from "./SignatureDialog";
import { BlockNoteMode, useBlockNoteStore } from "../store/blockNoteStore.ts";
import { View } from 'react-native';
import truncateEthAddress from 'truncate-eth-address';
import { Wallet } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  InputField,
} from '@ds3/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressAvatar from "../web3/AddressAvatar";
import Address from "../web3/Address";
import { isAddress } from 'viem';
import * as React from 'react';
import { Input, SwitchField } from '@ds3/react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react-native';
import { DatePickerField } from '../components/DatePickerField';

export const SablierBlock: any = createReactBlockSpec<CustomBlockConfig, typeof schema.inlineContentSchema, typeof schema.styleSchema>(
  {
    type: "sablier",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      shape: {
        default: "monthly",
        values: ["monthly"]
      },
      chain: {
        default: 1,
        values: supportedChains.map((c) => { return c.id } )
      },
      token: {
        default: '0x0000000000000000000000000000000000000000',
      },
      amount: {
        default: 0,
      },
      recipient: {
        default: ''
      },
      startDate: {
        default: '',
      },
      duration: {
        default: 1,
      },
      firstPayment: {
        default: "atStart",
        values: ["atStart", "endFirstMonth"]
      },
      transferability: {
        default: false
      }
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { editorMode: currentEditorMode } = useBlockNoteStore();

      return (
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Text className="flex items-center mr-auto">
                <SablierIcon className="w-8 h-8" /> Sablier Stream
              </Text>
              <SablierDialog block={props.block} editor={props.editor} disabled={currentEditorMode !== BlockNoteMode.EDIT}/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="grid grid-cols-3 gap-1">
              <View className="col-span-1 color-neutral-10">Shape</View>
              <View className="col-span-2 flex flex-row items-center gap-2"><MonthlyIcon /> Monthly unlocks</View>
              <View className="col-span-1 color-neutral-10">Chain</View>
              <View className="col-span-2 flex flex-row items-center gap-2">{props.block.props.chain && <><LineaIcon />{getChainById(props.block.props.chain)?.name}<Icons.SquareArrowOutUpRight size={18} /></>}</View>
              <View className="col-span-1 color-neutral-10">Token</View>
              <View className="col-span-2 flex flex-row items-center gap-2">{props.block.props.token && <><TokenIcon /> {truncateEthAddress(props.block.props.token)} <Icons.SquareArrowOutUpRight size={18} /></>}</View>
              <View className="col-span-1 color-neutral-10">Amount</View>
              <View className="col-span-2">{props.block.props.amount}</View>
              <View className="col-span-1 color-neutral-10">Duration</View>
              <View className="col-span-2"> {props.block.props.duration}{/** 3 months <Text className="color-neutral-10 text-3">(Sept 1, 2024 - Jan 1, 2024)</Text> */} </View>
              <View className="col-span-1 color-neutral-10">First Unlock</View>
              <View className="col-span-2">{props.block.props.startDate}{/** Oct 1, 2024 */}</View>
            </View>
          </CardContent>
        </Card>
      );
    },
  }
);

const SignatureBlock: any = createReactBlockSpec<CustomBlockConfig, typeof schema.inlineContentSchema, typeof schema.styleSchema>(
  {
    type: "signature",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      name: { default: '' },
      address: { default: '' }
    },
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <View className="mb-4 w-full">
          { !props.block.props.name || !props.block.props.address ?
            <SignatureDialog {...props} /> :
            <Signature name={props.block.props.name} address={props.block.props.address}/>
          }
        </View>
      );
    },
  }
);

const WalletAddressInline = createReactInlineContentSpec(
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

const DateTimeInline = createReactInlineContentSpec(
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

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    sablier: SablierBlock,
    signature: SignatureBlock
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    walletAddress: WalletAddressInline,
    dateTime: DateTimeInline,
  },
});

export type Block = typeof schema.Block;
export type SablierBlock = typeof schema.blockSchema.sablier;
export type SignatureBlock = typeof schema.blockSchema.signature;
