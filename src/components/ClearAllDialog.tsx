import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Text,
} from '@ds3/react';
import * as React from "react";
import {RotateCcw} from "lucide-react-native";
import newAgreement from '../templates/new-agreement.json';

interface ClearAllDialogProps {
  editor: any;
}

const ClearAllDialog: React.FC<ClearAllDialogProps> = ({ editor }) => {
  const clearDocument = () => {
    editor.replaceBlocks(editor.topLevelBlocks, newAgreement);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soft">
          <Button.Icon icon={RotateCcw} />
          <Button.Text>Clear All</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Clear All?</DialogTitle>
        </DialogHeader>
        <Text> Are you sure you want to clear the document? You will lose all of your progress. </Text>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='soft' color="neutral">
              <Button.Text>Cancel</Button.Text>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="soft" color="error" onPress={clearDocument}>
              <Button.Text>Continue</Button.Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default ClearAllDialog;