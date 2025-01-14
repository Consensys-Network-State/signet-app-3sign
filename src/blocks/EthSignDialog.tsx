import {
  Text,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ds3/react';

interface EthSignDialog {
  onPressSign: () => void;
  disabled: boolean;
}

const EthSignDialog = ({ onPressSign, disabled = false }: EthSignDialog) => {
  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant='outline'>
          <Text>Signing Dialog</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Complete Signing</DialogTitle>
          <DialogDescription>
            Sign the full document now to complete the signing ceremony and finalize the agreement.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost'>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button onPress={onPressSign}>
              <Text>Sign &amp; Finish</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default EthSignDialog;