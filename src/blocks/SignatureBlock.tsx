import { CustomBlockConfig, defaultProps } from '@blocknote/core';
import { createReactBlockSpec } from "@blocknote/react";
import { View } from 'react-native';
import { schema } from './BlockNoteSchema';
import Signature from "./Signature";
import SignatureDialog from "./SignatureDialog";

export const SignatureBlock = createReactBlockSpec<CustomBlockConfig, typeof schema.inlineContentSchema, typeof schema.styleSchema>(
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

export type SignatureBlock = typeof schema.blockSchema.signature; 