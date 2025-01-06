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
import SablierForm from "./SablierForm.tsx";

const SablierDialog = (props) => {
  console.log('HELLO', props.bnProps)
  return (
    <ScrollView contentContainerClassName='flex-1 justify-center items-center p-6'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Text>Edit</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[800px] max-w-[800px]'>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              <SablierForm />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button>
                <Text>OK</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
};

export default SablierDialog;