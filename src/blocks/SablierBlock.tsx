import { CustomBlockConfig, defaultProps } from '@blocknote/core';
import { createReactBlockSpec } from "@blocknote/react";
import { Icons, Card, CardContent, CardTitle, CardHeader, Text, IconButton } from "@ds3/react";
import SablierIcon from "../assets/sablier.svg?react";
import MonthlyIcon from "../assets/monthly.svg?react";
import LineaIcon from "../assets/linea.svg?react";
import TokenIcon from "../assets/token.svg?react";
import { supportedChains, getChainById } from "../utils/chainUtils";
import { BlockNoteMode, useBlockNoteStore } from "../store/blockNoteStore";
import { View } from 'react-native';
import truncateEthAddress from 'truncate-eth-address';
import { Variable } from 'lucide-react-native';
import ToggleDrawer from "./ToggleDrawer";
import { useDrawer } from '../hooks/useDrawer';
import { schema } from './BlockNoteSchema';

export const SablierBlock = createReactBlockSpec<CustomBlockConfig, typeof schema.inlineContentSchema, typeof schema.styleSchema>(
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
      const { openDrawer } = useDrawer();

      return (
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className="flex items-center">
              <View className="flex flex-row items-center mr-auto">
                <SablierIcon className="w-8 h-8" />
                <Text>Sablier Stream</Text>
              </View>
              <View className="flex flex-row gap-2">
                <IconButton
                  icon={Variable} 
                  variant="ghost" 
                  onPress={() => openDrawer('variables')}
                />
                <ToggleDrawer block={props.block} editor={props.editor} disabled={currentEditorMode !== BlockNoteMode.EDIT} />
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="grid grid-cols-3 gap-1">
              <View className="col-span-1">
                <Text className="color-neutral-10">Shape</Text>
              </View>
              <View className="col-span-2 flex flex-row items-center gap-2">
                <MonthlyIcon />
                <Text>Monthly unlocks</Text>
              </View>
              
              <View className="col-span-1">
                <Text className="color-neutral-10">Chain</Text>
              </View>
              <View className="col-span-2 flex flex-row items-center gap-2">
                {props.block.props.chain && (
                  <>
                    <LineaIcon />
                    <Text>{getChainById(props.block.props.chain)?.name}</Text>
                    <Icons.SquareArrowOutUpRight size={18} />
                  </>
                )}
              </View>
              
              <View className="col-span-1">
                <Text className="color-neutral-10">Token</Text>
              </View>
              <View className="col-span-2 flex flex-row items-center gap-2">
                {props.block.props.token && (
                  <>
                    <TokenIcon />
                    <Text>{truncateEthAddress(props.block.props.token)}</Text>
                    <Icons.SquareArrowOutUpRight size={18} />
                  </>
                )}
              </View>
              
              <View className="col-span-1">
                <Text className="color-neutral-10">Amount</Text>
              </View>
              <View className="col-span-2">
                <Text>{props.block.props.amount}</Text>
              </View>
              
              <View className="col-span-1">
                <Text className="color-neutral-10">Duration</Text>
              </View>
              <View className="col-span-2">
                <Text>{props.block.props.duration}</Text>
              </View>
              
              <View className="col-span-1">
                <Text className="color-neutral-10">First Unlock</Text>
              </View>
              <View className="col-span-2">
                <Text>{props.block.props.startDate}</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      );
    },
  }
);

export type SablierBlock = typeof schema.blockSchema.sablier; 