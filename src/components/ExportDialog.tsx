import { FC } from 'react';
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
    DialogTrigger, TextAreaField,
} from '@ds3/react';
import { useForm, Controller } from 'react-hook-form';
import {createDocumentVC} from "../utils/veramoUtils.ts";
import {useDocumentStore} from "../store/documentStore.ts";
import { useAccount } from "wagmi";

interface ExportDialogProps {
    onPressExport?: (res: string) => void;
}

interface ExportFormData {
    signatories: string;
}

const ExportDialog: FC<ExportDialogProps> =(props) => {
    const {handleSubmit, formState: { errors }, control} = useForm<ExportFormData>({
        defaultValues: {
            signatories: ""
        }
    });

    const { editDocumentState } = useDocumentStore();

    const { address } = useAccount();

    const onSubmit = async (data: ExportFormData) => {
        try {
            if (!address) throw new Error('Not signed in');
            const document = await createDocumentVC(address, data.signatories.split(',') as `0x${string}`[], editDocumentState);
            if (props.onPressExport) props.onPressExport(document)
        } catch (error: any) {
            console.log('Failed to Export', error);
        }

    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Text>Export</Text>
                </Button>
            </DialogTrigger>
            <DialogContent className='w-[520px] max-w-[520px]'>
                <DialogHeader>
                    <DialogTitle>Export Doc</DialogTitle>
                    <DialogDescription>
                        Set signatories and sign to export doc
                    </DialogDescription>
                </DialogHeader>
                <Controller
                    control={control}
                    name="signatories"
                    rules={{
                        required: 'signatories are required'
                    }}
                    render={({ field }) => (
                        <TextAreaField
                            label="Signatories"
                            placeholder="e.g. 0x1232..."
                            error={errors?.signatories?.message as string}
                            {...field}
                        />
                    )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='ghost'>
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>

                    <DialogClose asChild>
                        <Button onPress={handleSubmit(onSubmit)}>
                            <Text>Export</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};

export default ExportDialog;