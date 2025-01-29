import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  InputField,
} from '@ds3/react';
import * as React from "react";
import {ReactNode} from "react";

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
        </DialogHeader>
        <InputField disabled value={sigVC} multiline numberOfLines={4} label={"This is the signature in a portable VC format"}/>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost'>
              <Button.Text>Close</Button.Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default ViewSignatureDialog;