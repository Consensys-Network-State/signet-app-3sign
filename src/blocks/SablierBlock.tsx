import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Icons, Card, CardContent, CardTitle, CardHeader, Text, Button } from "@ds3/react";
import SablierIcon from "../assets/sablier.svg?react";
import MonthlyIcon from "../assets/monthly.svg?react";
import LineaIcon from "../assets/linea.svg?react";
import TokenIcon from "../assets/token.svg?react";
import SablierDialog from "./SablierDialog.tsx";
import { supportedChains, getChainById } from "../utils/chainUtils";

export const SablierBlock = createReactBlockSpec(
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
        values: supportedChains.map((c) => { console.log(supportedChains); return c.id } )
      },
      token: {
        default: "",
      },
      amount: {
        default: 0,
      },
      duration: {
        default: 1,
      },
      firstUnlock: {
        default: 'default',
      }
    },
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Text className="flex items-center mr-auto">
                <SablierIcon className="w-8 h-8" /> Sablier Stream
              </Text>

              <SablierDialog {...props}>
                <Button variant="ghost" size="sm">
                  <Icons.Pencil className="w-5 h-5 text-muted-foreground" />
                </Button>
              </SablierDialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              <div className="col-span-1 color-neutral-10">Shape</div>
              <div className="col-span-2 flex items-center gap-2"><MonthlyIcon /> Monthly unlocks</div>
              <div className="col-span-1 color-neutral-10">Chain</div>
              <div className="col-span-2 flex items-center gap-2">{props.block.props.chain && <><LineaIcon />{getChainById(props.block.props.chain)?.name}<Icons.SquareArrowOutUpRight size={18} /></>}</div>
              <div className="col-span-1 color-neutral-10">Token</div>
              <div className="col-span-2 flex items-center gap-2">{props.block.props.token && <><TokenIcon /> {props.block.props.token} <Icons.SquareArrowOutUpRight size={18} /></>}</div>
              <div className="col-span-1 color-neutral-10">Amount</div>
              <div className="col-span-2">{props.block.props.amount}</div>
              <div className="col-span-1 color-neutral-10">Duration</div>
              <div className="col-span-2"> {props.block.props.duration}{/** 3 months <Text className="color-neutral-10 text-3">(Sept 1, 2024 - Jan 1, 2024)</Text> */} </div>
              <div className="col-span-1 color-neutral-10">First Unlock</div>
              <div className="col-span-2">{props.block.props.firstUnlock}{/** Oct 1, 2024 */}</div>
            </div>
          </CardContent>
        </Card>
      );
    },
  }
);
