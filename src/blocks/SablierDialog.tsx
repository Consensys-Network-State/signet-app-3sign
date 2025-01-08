import { ScrollView, View } from 'react-native';
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
  Card,
  CardContent,
} from '@ds3/react';
import SablierForm, { FormData } from "./SablierForm.tsx";
import { useForm } from 'react-hook-form';
import SablierIcon from "../assets/sablier.svg?react";

const SablierDialog = () => {
  const form = useForm<FormData>();

  const {
    reset,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormData) => {
    console.log("Sablier Form Data", JSON.stringify(data, null, 2));
    reset();
  };

  return (
    <ScrollView contentContainerClassName='flex-1 justify-center items-center p-6'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Text>Sablier Dialog</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[800px]'>
          <DialogHeader>
            <DialogTitle>Configure Contract</DialogTitle>
            <DialogDescription>
              <Card className="w-full mb-4">
                <CardContent className="flex flex-row items-center p-4 gap-4">
                  <SablierIcon className="w-8 h-8" />

                  <View>
                    <Text className="font-bold">Sablier Stream</Text>
                    <Text className="text-sm text-muted-foreground">Monthly Unlocks</Text>
                  </View>

                </CardContent>
              </Card>
              <SablierForm form={form} />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>
                <Text>Cancel</Text>
              </Button>
            </DialogClose>

            {isValid ?
              <DialogClose asChild>
                <Button onPress={handleSubmit(onSubmit)}>
                  <Text>Save</Text>
                </Button>
              </DialogClose> :
              <Button onPress={handleSubmit(onSubmit)}>
                <Text>Save</Text>
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
};

export default SablierDialog;