import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import Signature from "./Signature.tsx";

export const SignatureBlock = createReactBlockSpec(
  {
    type: "signature",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "warning",
        values: ["warning", "error", "info", "success"],
      },
    },
    content: "inline",
  },
  {
    render: () => {
      return (<Signature />);
    },
  }
);
