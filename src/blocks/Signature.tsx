import { FC } from 'react';
import { Card, Button, CardContent, CardFooter, CardDescription, CardTitle, CardHeader, Text, Icons, Dialog } from "@ds3/react";

const Signature = (props) => {
  return (
    <div className="mb-4">
      { !props.block.props.name || !props.block.props.address ?
        <>
          <Button
            onPress={() => {
              if (!props.editor.isEditable) {
                props.editor.updateBlock(props.block, {
                  props: { name: 'SupCOD3r', address: '0xA8fa580C55BDC32e678f27EE9EAf608f2cE7fF'},
                })
              }
            }}
          >
            <div className="flex"><Icons.Signature className="w-5 h-5" /><Text>SIGN HERE</Text></div>
          </Button>
        </> :
        <>
          <div className="mb-4 color-neutral-11">Signed By:</div>
          <div className="border-l-4 border-secondary-9 pl-2">
            <div className="text-12 color-neutral-12">{props.block.props.name}</div>
            <div className="color-neutral-a11">{props.block.props.address}</div>
          </div>
        </>
      }
    </div>
  );
};

export default Signature;
