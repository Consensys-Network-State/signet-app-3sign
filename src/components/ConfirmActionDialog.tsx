import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, Button } from "@ds3/react";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  type: 'publish' | 'transition';
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({ open, onOpenChange, onConfirm, loading, type }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {type === 'publish' ? 'Publish Agreement' : 'Execute Action'}
        </DialogTitle>
        <DialogDescription>
          {type === 'publish'
            ? 'Publishing this agreement will create a verifiable claim that will be stored on Arweave. This verifiable claim needs to be signed by a wallet so you will be prompted to sign using a MetaMask wallet. This action is immutable and irreversible.'
            : 'Are you sure you want to execute this action? You may be prompted to sign with your MetaMask wallet.'}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="soft" color="neutral">
            <Button.Text>Cancel</Button.Text>
          </Button>
        </DialogClose>
        <Button
          variant="solid"
          color="primary"
          onPress={onConfirm}
          loading={loading}
        >
          <Button.Spinner />
          <Button.Text>
            {type === 'publish' ? 'Sign & Publish' : 'Sign & Execute'}
          </Button.Text>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmActionDialog; 