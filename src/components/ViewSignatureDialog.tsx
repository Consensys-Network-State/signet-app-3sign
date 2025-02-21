import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@ds3/react';
import * as React from "react";
import {ReactNode} from "react";
import {InputClipboard} from "./InputClipboard.tsx";

interface ViewSignatureDialogProps {
  sigVC: string,
  children?: ReactNode,
}

const ViewSignatureDialog: React.FC<ViewSignatureDialogProps> = ({ sigVC, children }) => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        { children ? children :
          <Button variant='soft'>
            <Button.Text>View Signature</Button.Text>
          </Button>
        }
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Signature</DialogTitle>
          <DialogDescription>
            This is the signature in a portable VC format
          </DialogDescription>
        </DialogHeader>

        <InputClipboard value={sigVC} multiline numberOfLines={12} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='soft' color="primary">
              <Button.Text>Close</Button.Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default ViewSignatureDialog;