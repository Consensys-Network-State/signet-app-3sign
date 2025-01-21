import React, {useEffect, useState} from "react";
import { useParams } from "react-router";
import { ModeToggle, Text } from "@ds3/react";
import Account from "../web3/Account.tsx";
import EthSignDialog from "../blocks/EthSignDialog.tsx";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {getDocument, postSignature} from "../api";
import DocumentView from "../components/DocumentView.tsx";
import {createSignatureVC, validateAndProcessDocumentVC} from "../utils/veramoUtils.ts";
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {BlockNoteMode, useBlockNoteStore} from "../store/blockNoteStore.ts";
import { useAccount } from "wagmi";

const Document = () => {
    const { documentId } = useParams(); // Extracts :username from the URL
    const { isPending, isError, data, error } = useQuery({ queryKey: ['documents', documentId], queryFn: () => getDocument(documentId) });
    const mutation = useMutation({
        mutationFn: ({ documentId, signatureVC }) => postSignature(documentId, signatureVC)
    })

    const { editorMode, setEditorMode } = useBlockNoteStore();

    const [document, setDocument] = useState<Block[] | null>(null);
    const [isSigned, setIsSigned] = useState<boolean>(false);

    useEffect(() => {
        const queryHandler = async () => {
            if (!isPending && !isError && data) {
                const processedDocument = await validateAndProcessDocumentVC(JSON.parse(data.data.Document));
                setDocument(processedDocument.document);


                if (address.toLowerCase() === data.data.DocumentOwner) {
                    setEditorMode(BlockNoteMode.VIEW);
                    // TODO: Check if all signers have signed
                    setIsSigned(!!data.data.Signatures[data.data.Signatories[0]])
                } else if (data.data.Signatories.find((a) => a === address.toLowerCase())) {
                    if (!!data.data.Signatures[address.toLowerCase()]) {
                        setEditorMode(BlockNoteMode.VIEW);
                        setIsSigned(true);
                    } else {
                        setEditorMode(BlockNoteMode.SIGNATURE);
                        setIsSigned(false);
                    }
                }
            }
        }
        queryHandler();
    }, [isPending, isError, data])

    const { address } = useAccount();

    const queryClient = useQueryClient()

    useEffect(() => {
        if (mutation.isSuccess) {
            console.log('INVALIDATING QUERY')
            queryClient.invalidateQueries({ queryKey: ['documents', documentId] })
        }
    }, [mutation.isSuccess])

    const handleSignDocument = async () => {
        // Validation
        // if (!address) throw new Error('Not signed in');

        // if (!signatories.find((a) => a === address)) throw new Error('You are not a signer for this document');

        // if (numOfSignedSignatureBlocks !== numOfSignatureBlocks) {
        //   throw new Error('No signatures');
        // }

        const signatureVC = await createSignatureVC(address, [], data.data.Document);
        mutation.mutate({ documentId, signatureVC });
    }

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
                        { editorMode === BlockNoteMode.SIGNATURE &&
                            <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                                <Text>Review the document, fill in all details required, and sign all signature blocks</Text>
                                <div className="flex space-x-4">
                                    <EthSignDialog onPressSign={handleSignDocument} />
                                </div>
                            </div>
                        }
                        { editorMode === BlockNoteMode.VIEW &&
                            <div className="bg-primary-4 p-2 flex items-center justify-between rounded-t-3 sticky top-0 z-20">
                                <Text>{isSigned ? "Document Is Signed!!!" : "Document Is Not Signed"}</Text>
                            </div>
                        }
                        { isPending && <span>Loading...</span> }
                        { isError && <span>Error: {error.message}</span> }
                        { !isPending && !isError && document &&
                            <DocumentView document={document} owner={data.data.DocumentOwner} signatories={data.data.Signatories} />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Document;