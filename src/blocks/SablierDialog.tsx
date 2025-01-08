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
import SablierForm, { FormData } from "./SablierForm.tsx";
import { useForm } from 'react-hook-form';

const SablierDialog = () => {
  const form = useForm<FormData>();

  const {
    reset,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormData) => {
    debugger;
    console.log("Form Data", JSON.stringify(data));
    reset();
  };

  return (
    <ScrollView contentContainerClassName='flex-1 justify-center items-center p-6'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Text>Edit</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[800px]'>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              <SablierForm form={form} />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button>
                <Text>Cancel</Text>
              </Button>
            </DialogClose>

            {isValid ?
              <DialogClose asChild>
                <Button onPress={handleSubmit(onSubmit)}>
                  <Text>Submit</Text>
                </Button>
              </DialogClose> :
              <Button onPress={handleSubmit(onSubmit)}>
                <Text>Submit</Text>
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
};

export default SablierDialog;