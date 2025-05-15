import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ds3/ui';
import * as React from 'react';
import { Trash2 } from 'lucide-react-native';

interface DeleteDraftDialogProps {
  onDelete: () => void;
  disabled?: boolean;
  triggerProps?: any;
}

const DeleteDraftDialog: React.FC<DeleteDraftDialogProps> = ({
  onDelete,
  disabled = false,
  triggerProps = {}
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <Button 
          variant="ghost" 
          color="error" 
          {...triggerProps}
        >
          <Button.Icon icon={Trash2} />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Delete Draft</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this draft? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost'>
              <Button.Text>Cancel</Button.Text>
            </Button>
          </DialogClose>
          <Button 
            variant="soft" 
            color="error" 
            onClick={handleDelete} 
            loading={isLoading}
          >
            <Button.Text>{isLoading ? 'Deleting...' : 'Delete'}</Button.Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDraftDialog; 