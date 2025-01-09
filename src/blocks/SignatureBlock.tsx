import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import Signature from "./Signature.tsx";
import SignatureDialog from "./SignatureDialog";

export const SignatureBlock = createReactBlockSpec(
  {
    type: "signature",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      name: {
        default: "",
      },
      address: {
        default: "",
      }

    },
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div className="mb-4">
          { !props.block.props.name || !props.block.props.address ?
            <SignatureDialog {...props} /> :
            <Signature name={props.block.props.name} address={props.block.props.address}/>
          }
        </div>
      );
    },
  }
);
