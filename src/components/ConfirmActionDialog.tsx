import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, Button } from "@ds3/ui";

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
          {type === 'publish' ? 'Publish Agreement' : 'Publish Updated Agreement'}
        </DialogTitle>
        <DialogDescription>
          Publishing this {type === 'publish' ? 'agreement' : 'update'} will create a verifiable claim that will be stored on Arweave. This verifiable claim needs to be signed by a wallet so you will be prompted to sign using a Meta Mask wallet. This action is immutable and irreversible.
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
            Sign & Publish
          </Button.Text>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmActionDialog; 