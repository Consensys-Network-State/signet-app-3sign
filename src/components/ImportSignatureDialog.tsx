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
import {setupAgent} from "../veramo";
import {useDocumentStore} from "../store/documentStore.ts";
import {ethers} from 'ethers';
import {encodeObjectToBase64} from "../utils/veramoUtils.ts";

interface ImportSignatureFormData {
    signatureVC: string;
}

const ImportSignatureDialog: FC = () => {
    const {handleSubmit, formState: { errors }, control} = useForm<ImportSignatureFormData>({
        defaultValues: {
            signatureVC: ""
        }
    });

    const { signatories, documentVC } = useDocumentStore();
    const onSubmit = async (data: ImportSignatureFormData) => {
        try {
            // TEMPORARY: For now just check that this signature is valid and print in console that it was successful
            const agent = await setupAgent();
            const credential = JSON.parse(data.signatureVC);
            const verificationResult = await agent.verifyCredential({ credential });
            if (!verificationResult.verified) throw new Error('Failed to sign document');
            if (credential.credentialSubject.documentHash !== ethers.keccak256(new TextEncoder().encode(encodeObjectToBase64(JSON.parse(documentVC))!))) {
                throw new Error('Document Hash Doesn\'t Match');
            }
            if (signatories.find((addr) => addr === credential.issuer.id.replace("did:pkh:eip155:1:", ""))) {
                console.log('Successful signature: Doc is now signed')
                return;
            }
        } catch (error: any) {
            console.log('Failed to Import Signature', error);
        }

    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline'>
                    <Text>Import Signature</Text>
                </Button>
            </DialogTrigger>
            <DialogContent className='w-[520px] max-w-[520px]'>
                <DialogHeader>
                    <DialogTitle>Import Signature</DialogTitle>
                    <DialogDescription>
                        Paste in a Signature VC
                    </DialogDescription>
                </DialogHeader>
                <Controller
                    control={control}
                    name="signatureVC"
                    rules={{
                        required: 'signatureVC is required'
                    }}
                    render={({ field }) => (
                        <InputField
                            label="VC"
                            placeholder="Input vc"
                            multiline
                            numberOfLines={4}
                            error={errors?.signatureVC?.message as string}
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

export default ImportSignatureDialog;