import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultProps,
  CustomBlockConfig,
} from '@blocknote/core';
import { createReactBlockSpec } from "@blocknote/react";
import { Icons, Card, CardContent, CardTitle, CardHeader, Text } from "@ds3/react";
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

      console.log('Props', props.block.props)
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



export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    sablier: SablierBlock,
    signature: SignatureBlock
  },
});

export type Block = typeof schema.Block;
export type SablierBlock = typeof schema.blockSchema.sablier;
export type SignatureBlock = typeof schema.blockSchema.signature;
