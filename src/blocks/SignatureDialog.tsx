import { ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
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
  InputField,
  Label,
  Card,
  CardContent,
} from '@ds3/react';
import Signature from "./Signature.tsx";

export type FormData = {
  name: string,
  address: string,
};

const SignatureDialog = (props) => {
  const form = useForm<FormData>();

  const {
    reset,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = form;

  const onSubmit = (data: FormData) => {
    console.log("Signature Form Data", JSON.stringify(data, null, 2));
    props.editor.updateBlock(props.block, {
      props: { name: data.name, address: data.address},
    })
    reset();
  };

  const {
    name,
    address
  } = watch();

  return (
    <ScrollView contentContainerClassName='flex-1 justify-center items-center p-6'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Text>Signature Dialog</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[520px] max-w-[520px]'>
          <DialogHeader>
            <DialogTitle>Adopt Your Signature</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-4">
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: 'Name is required'
                  }}
                  render={({ field }) => (
                    <InputField
                      label="Full Name"
                      placeholder="Your name"
                      error={errors?.name?.message as string}
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="address"
                  rules={{
                    required: 'Address is required'
                  }}
                  render={({ field }) => (
                    <InputField
                      label="Address"
                      placeholder="Your address"
                      error={errors?.address?.message as string}
                      {...field}
                    />
                  )}
                />

                <Label><Text>Preview</Text></Label>

                <Card className='w-full'>
                  <CardContent className='p-4'>
                    {name || address ?
                      <Signature name={name} address={address} /> :
                      <Text className="text-center">Complete information to generate signature preview.</Text>
                    }

                  </CardContent>
                </Card>
              </div>
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
                  <Text>Adopt and Sign</Text>
                </Button>
              </DialogClose> :
              <Button onPress={handleSubmit(onSubmit)}>
                <Text>Adopt and Sign</Text>
              </Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  )
};

export default SignatureDialog;