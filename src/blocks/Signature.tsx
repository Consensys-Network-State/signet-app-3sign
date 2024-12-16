import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Card, CardContent, CardFooter, CardDescription, CardTitle, CardHeader, Text } from "@ds3/react";

// The Alert block.
export const Signature = createReactBlockSpec(
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
    render: (props) => {
      return (
        <div className="mb-4">
          <div className="mb-4 color-neutral-11">Signed By:</div>

          <div className="border-l-4 border-secondary-9 pl-2">
            <div className="text-12 color-neutral-12">SupCOD3r</div>
            <div className="color-neutral-a11">0xA8fa580C55BDC32e678f27EE9EAf608f2cE7fF</div>
          </div>
        </div>
      );
    },
  }
);
