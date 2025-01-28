import {useEffect, useMemo, useState} from "react";
import { useParams, useLocation } from "react-router";
import {
    Button, Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    InputField,
    ModeToggle, Text
} from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useQuery } from '@tanstack/react-query'
import {getDocument} from "../api";
import {validateAndProcessDocumentVC} from "../utils/veramoUtils.ts";
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {BlockNoteMode, useBlockNoteStore} from "../store/blockNoteStore.ts";
import { useAccount } from "wagmi";
import BNDocumentView, {DocumentStatus} from "../components/BNDocumentView.tsx";
import {DocumentPayload} from "../types";
import * as React from "react";
const Document = () => {
    const location = useLocation();
    const { documentId } = useParams(); // Extracts :username from the URL
    const { isPending, isError, data, error } = useQuery({ queryKey: ['documents', documentId], queryFn: () => getDocument(documentId!) });
    const { setEditorMode } = useBlockNoteStore();

    const [document, setDocument] = useState<Block[] | null>(null);

    const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(DocumentStatus.UNDEFINED);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const { address } = useAccount();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Check if we arrived here with showModal flag
        if (location.state?.showModal) {
            setIsModalOpen(true);
        }
    }, [location]);

    useEffect(() => {
        const queryHandler = async () => {
            if (!address) return;
            if (!isPending && !isError && data) {
                const processedDocument = await validateAndProcessDocumentVC(JSON.parse(data.data.Document));
                setDocument(processedDocument.document);

                if (address.toLowerCase() === data.data.DocumentOwner) { // If you are the owner
                    setEditorMode(BlockNoteMode.VIEW);
                    // TODO: Check if all signers have signed
                    setDocumentStatus(!!data.data.Signatures[data.data.Signatories[0]] ? DocumentStatus.SIGNED : DocumentStatus.UNSIGNED)
                } else if (data.data.Signatories.find((a: string) => a === address.toLowerCase())) { // If you are a signer ...
                    if (!!data.data.Signatures[address.toLowerCase()]) { // ... and you have signed
                        setEditorMode(BlockNoteMode.VIEW);
                        setDocumentStatus(DocumentStatus.SIGNED);
                    } else { // ... and you haven't signed
                        setEditorMode(BlockNoteMode.SIGNATURE);
                        setDocumentStatus(DocumentStatus.UNSIGNED);
                    }
                }
                setIsInitialized(true);
            }
        }
        queryHandler();
    }, [isPending, isError, data, address])

    const isAuthorized = useMemo(() => {
        if (!address) return false;
        return !(address.toLowerCase() !== data?.data?.DocumentOwner && !(data?.data?.Signatories || []).find((a: string) => a === address.toLowerCase()));
    }, [address, data]);

    const isLoading = isPending || !isInitialized;

    return (
        <>
            <Dialog open={isModalOpen}>
                <DialogContent className='w-[520px] max-w-[520px]'>
                    <DialogHeader>
                        <DialogTitle>Success!</DialogTitle>
                        <DialogDescription>You have successfully published this agreement</DialogDescription>
                    </DialogHeader>
                    <InputField disabled value={`${window.location.origin}${location.pathname}`} label={"Send this link to the parties that need to sign"}/>
                    <DialogFooter>
                        <Button variant='ghost' onPress={() => setIsModalOpen(false)}>
                            <Text>Close</Text>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="h-screen">
                <div className="flex flex-col h-full">
                    <div className="bg-blue-500 text-white p-4 flex items-center justify-between m-3 rounded-3">
                        <h1 className="text-lg font-bold">APOC</h1>
                        <div className="flex space-x-4">
                            <Account />
                            <ModeToggle />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        <div className="mx-auto w-full max-w-[1200px] p-4">
                            { isLoading && <span>Loading...</span> }
                            { isError && <span>Error: {error.message}</span> }
                            { !isLoading && !isError &&
                                (isAuthorized ?
                                    <BNDocumentView
                                        documentPayload={{ documentId, documentVC: data.data.Document, signatures: Object.values(data.data.Signatures), document } as DocumentPayload}
                                        documentStatus={documentStatus}
                                    /> :
                                    <span>You Don't Have Access To This Document</span>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Document;