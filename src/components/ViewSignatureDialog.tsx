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
} from '@ds3/react';
import * as React from "react";

interface ViewSignatureDialogProps {
    sigVC: string,
}

const ViewSignatureDialog: React.FC<ViewSignatureDialogProps> = ({ sigVC }) => {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Text>View Signature</Text>
                </Button>
            </DialogTrigger>
            <DialogContent className='w-[520px] max-w-[520px]'>
                <DialogHeader>
                    <DialogTitle>Signature</DialogTitle>
                    <DialogDescription>
                        This Agreement Has Been Signed
                    </DialogDescription>
                </DialogHeader>
                <InputField disabled value={sigVC} multiline numberOfLines={4} label={"This is the signature in a portable VC format"}/>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='ghost'>
                            <Button.Text>Close</Button.Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};

export default ViewSignatureDialog;