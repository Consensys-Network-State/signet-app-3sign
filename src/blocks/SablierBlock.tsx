import { CustomBlockConfig, defaultProps } from '@blocknote/core';
import { createReactBlockSpec } from "@blocknote/react";
import { Card, CardContent, CardTitle, CardHeader, Text, IconButton, Button } from "@ds3/react";
import SablierIcon from "../assets/sablier.svg?react";
import { supportedChains } from "../utils/chainUtils";
import { BlockNoteMode, useBlockNoteStore } from "../store/blockNoteStore";
import { View } from 'react-native';
import { Variable } from 'lucide-react-native';
import ToggleDrawer from "./ToggleDrawer";
import { useDrawer } from '../hooks/useDrawer';
import { schema } from './BlockNoteSchema';
import { insertOrUpdateBlock } from '@blocknote/core';
import SablierForm, { FormData } from "./SablierForm";
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import dayjs from 'dayjs';

export const insertSablier = (editor: typeof schema.BlockNoteEditor, openDrawer: (id: string, type: string) => void) => ({
  title: "Sablier",
  subtext: "Unlock assets on the same day each month",
  onItemClick: () => {
    const block = insertOrUpdateBlock(editor, {
      type: "sablier",
    });

    // Open the drawer for the newly inserted block
    if (block) {
      openDrawer(block.id, block.type);
    }
  },
  aliases: ["sablier"],
  group: "Contract Blocks",
  icon: <SablierIcon className="w-5 h-5" />,
});

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
      const form = useForm<FormData>({
        defaultValues: {
          chain: { value: props.block.props.chain, label: props.block.props.chain },
          token: props.block.props.token,
          amount: props.block.props.amount,
          recipient: props.block.props.recipient,
          startDate: props.block.props.startDate ? dayjs(props.block.props.startDate, 'MMM D, YYYY') : undefined,
          duration: props.block.props.duration,
          firstPayment: props.block.props.firstPayment,
          transferability: props.block.props.transferability
        }
      });

      // Reset form when block changes
      useEffect(() => {
        form.reset({
          chain: { value: props.block.props.chain, label: props.block.props.chain },
          token: props.block.props.token,
          amount: props.block.props.amount,
          recipient: props.block.props.recipient,
          startDate: props.block.props.startDate ? dayjs(props.block.props.startDate, 'MMM D, YYYY') : undefined,
          duration: props.block.props.duration,
          firstPayment: props.block.props.firstPayment,
          transferability: props.block.props.transferability
        });
      }, [props.block.id]);

      const onSubmit = (data: FormData) => {
        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            chain: parseInt(data.chain!.value),
            token: data.token,
            amount: data.amount,
            recipient: data.recipient,
            startDate: data.startDate?.format('MMM D, YYYY'),
            duration: parseInt(data.duration),
            firstPayment: data.firstPayment,
            transferability: data.transferability,
          },
        });
      };

      return (
        <Card className='w-full'>
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
                <ToggleDrawer 
                  block={props.block} 
                  editor={props.editor} 
                  disabled={currentEditorMode !== BlockNoteMode.EDIT} 
                />
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="grid grid-cols-2 gap-x-8">
              {/* First Column */}
              <View className="flex flex-col gap-4">
                <SablierForm 
                  form={form} 
                  fields={['chain', 'token', 'amount', 'recipient']} 
                />
              </View>
              
              {/* Second Column */}
              <View className="flex flex-col gap-4">
                <SablierForm 
                  form={form} 
                  fields={['startDate', 'duration', 'firstPayment', 'transferability']} 
                />
              </View>
            </View>
            
            <View className="flex flex-row justify-end gap-2 mt-4 pt-4 border-t border-neutral-6">
              <Button
                variant="soft"
                color="primary"
                onPress={form.handleSubmit(onSubmit)}
              >
                <Text>Save</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      );
    },
  }
);

export type SablierBlock = typeof schema.blockSchema.sablier; 