import { ScrollView } from 'react-native';
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

const EthSignDialog = () => {
  return (
    <ScrollView contentContainerClassName='flex-1 justify-center items-center p-6'>
      <Dialog>
        <DialogTrigger asChild>
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
              <Button>
                <Text>Sign &amp; Finish</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
};

export default EthSignDialog;