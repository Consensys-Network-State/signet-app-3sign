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
    DialogTrigger,
    InputField
} from '@ds3/react';
import { useForm, Controller } from 'react-hook-form';
import {validateAndProcessDocumentVC} from "../utils/veramoUtils.ts";
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {useDocumentStore} from "../store/documentStore.ts";

interface ImportDialogProps {
    editor: any;
}

interface ImportFormData {
    documentVC: string;
}

const ImportDialog: FC<ImportDialogProps> =(props) => {
    const {handleSubmit, formState: { errors }, control} = useForm<ImportFormData>({
        defaultValues: {
            documentVC: ""
        }
    });

    const { setSignatories, setDocumentVC } = useDocumentStore();

    const onSubmit = async (data: ImportFormData) => {
        try {
            const { document, signatories } = await validateAndProcessDocumentVC(JSON.parse(data.documentVC));
            props.editor.replaceBlocks(props.editor.document.map((block: Block) => block.id), document);
            setDocumentVC(data.documentVC);
            if (signatories) setSignatories(signatories);
        } catch (error: any) {
            console.log('Failed to Import', error);
        }

    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Text>Import</Text>
                </Button>
            </DialogTrigger>
            <DialogContent className='w-[520px] max-w-[520px]'>
                <DialogHeader>
                    <DialogTitle>Import Doc</DialogTitle>
                    <DialogDescription>
                        Past in a Doc VC
                    </DialogDescription>
                </DialogHeader>
                <Controller
                    control={control}
                    name="documentVC"
                    rules={{
                        required: 'documentVC is required'
                    }}
                    render={({ field }) => (
                        <InputField
                            label="VC"
                            placeholder="Input vc"
                            multiline
                            numberOfLines={4}
                            error={errors?.documentVC?.message as string}
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
                            <Text>Import</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};

export default ImportDialog;