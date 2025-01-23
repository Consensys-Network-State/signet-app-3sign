import {useEffect, useMemo, useState} from "react";
import { useParams, useSearchParams } from "react-router";
import { ModeToggle } from "@ds3/react";
import Account from "../web3/Account.tsx";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {getDocument, postSignature} from "../api";
import {validateAndProcessDocumentVC} from "../utils/veramoUtils.ts";
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {BlockNoteMode, useBlockNoteStore} from "../store/blockNoteStore.ts";
import { useAccount } from "wagmi";
import BNDocumentView, {DocumentStatus} from "../components/BNDocumentView.tsx";
import {DocumentPayload} from "../types";
const Document = () => {
    const { documentId } = useParams(); // Extracts :username from the URL
    const [ searchParams ] = useSearchParams();
    const encryptionKey = searchParams.get('key');
    const { isPending, isError, data, error } = useQuery({ queryKey: ['documents', documentId], queryFn: () => getDocument(documentId!) });
    const mutation = useMutation({
        mutationFn: ({ documentId, signatureVC }: { documentId: string, signatureVC: string }) => postSignature(documentId, signatureVC)
    })

    const { setEditorMode } = useBlockNoteStore();

    const [document, setDocument] = useState<Block[] | null>(null);

    const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(DocumentStatus.UNDEFINED);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const { address } = useAccount();
    const queryClient = useQueryClient()

    useEffect(() => {
        const queryHandler = async () => {
            if (!address) return;
            if (!isPending && !isError && data && encryptionKey) {

                const processedDocument = await validateAndProcessDocumentVC(JSON.parse(data.data.Document), encryptionKey);
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
    }, [isPending, isError, data, address, encryptionKey])

    useEffect(() => {
        if (mutation.isSuccess) {
            queryClient.invalidateQueries({ queryKey: ['documents', documentId] })
        }
    }, [mutation.isSuccess])

    const isAuthorized = useMemo(() => {
        if (!address) return false;
        return !(address.toLowerCase() !== data?.data?.DocumentOwner && !(data?.data?.Signatories || []).find((a: string) => a === address.toLowerCase()));
    }, [address, data]);

    const isLoading = isPending || !isInitialized;

    return (
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
                        {/*{ editorMode === BlockNoteMode.VIEW &&*/}
                        {/*    <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">*/}
                        {/*        <Text>{isSigned ? "Document Is Signed!!!" : "Document Is Not Signed"}</Text>*/}
                        {/*    </div>*/}
                        {/*}*/}
                        { isLoading && <span>Loading...</span> }
                        { isError && <span>Error: {error.message}</span> }
                        { !isLoading && !isError &&
                            (isAuthorized ?
                                <BNDocumentView
                                    documentPayload={{ documentId, documentVC: data.data.Document, document } as DocumentPayload}
                                    documentStatus={documentStatus}
                                /> :
                                <span>You Don't Have Access To This Document</span>)
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Document;