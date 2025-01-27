import {FC, useEffect} from 'react';
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
    InputField
} from '@ds3/react';
import { useForm, Controller } from 'react-hook-form';
import {createDocumentVC} from "../utils/veramoUtils.ts";
import { useAccount } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import {postDocument} from "../api";
import { useNavigate } from "react-router";

interface ExportFormData {
    signatories: string;
}

interface ExportDialogProps {
    editor: any;
}

const ExportDialog: FC<ExportDialogProps> = ({ editor }) => {
    const {handleSubmit, formState: { errors }, control} = useForm<ExportFormData>({
        defaultValues: {
            signatories: ""
        }
    });

    const mutation = useMutation({
        mutationFn: postDocument
    })

    const navigate = useNavigate();

    useEffect(() => {
        if (mutation.isSuccess && mutation.data) {
            const { processId } = mutation.data?.data || {};
            navigate(`/${processId}`);
        }
    }, [mutation.isSuccess, mutation.data])

    const { address } = useAccount();

    const onSubmit = async (data: ExportFormData) => {
        try {
            if (!address) throw new Error('Not signed in');
            const document = await createDocumentVC(address, data.signatories.split(',') as `0x${string}`[], editor.document);
            mutation.mutate(document);
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
                        <InputField
                            label="Signatories"
                            placeholder="e.g. 0x1232..."
                            multiline
                            numberOfLines={4}
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