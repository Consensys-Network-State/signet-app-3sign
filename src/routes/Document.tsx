import * as React from 'react';
import { useParams, useLocation } from "react-router";
import {
  Button, Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputField,
  Text,
  Spinner,
} from "@ds3/react";
import { useQuery } from '@tanstack/react-query'
import {getDocument} from "../api";
import {validateAndProcessDocumentVC} from "../utils/veramoUtils.ts";
import {Block} from "../blocks/BlockNoteSchema.tsx";
import {BlockNoteMode, useBlockNoteStore} from "../store/blockNoteStore.ts";
import { useAccount, useDisconnect } from "wagmi";
import BNDocumentView, { DocumentStatus } from "../components/BNDocumentView.tsx";
import { DocumentPayload } from "../types";
import { View } from 'react-native';

const Document = () => {
  const location = useLocation();
  const { disconnect } = useDisconnect()
  const { documentId } = useParams(); // Extracts :username from the URL
  const { isPending, isError, data, error } = useQuery({ queryKey: ['documents', documentId], queryFn: () => getDocument(documentId!) });
  const { setEditorMode } = useBlockNoteStore();

  const [document, setDocument] = React.useState<Block[] | null>(null);

  const [documentStatus, setDocumentStatus] = React.useState<DocumentStatus>(DocumentStatus.UNDEFINED);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Check if we arrived here with showModal flag
    if (location.state?.showModal) {
      setIsModalOpen(true);
    }
  }, [location]);

  React.useEffect(() => {
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
  }, [isPending, isError, data, address, setEditorMode])

  const isAuthorized = React.useMemo(() => {
    if (!address) return false;
    return !(address.toLowerCase() !== data?.data?.DocumentOwner && !(data?.data?.Signatories || []).find((a: string) => a === address.toLowerCase()));
  }, [address, data]);

  const isLoading = isPending || !isInitialized;

  const FullView: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <View className="h-screen flex items-center justify-center">
        <View className="flex items-center justify-center">
          {children}
        </View>
      </View>
    );
  }

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

      <>
        { isLoading &&
          <FullView>
            <Spinner className="h-9 w-9" color="primary" />
          </FullView>
        }

        { isError &&
          <FullView>
            <Text>Error: {error.message}</Text>
            <Button variant="soft" onPress={disconnect}>
              <Button.Text>Disconnnect</Button.Text>
            </Button>
          </FullView>
        }

        { !isLoading && !isError &&
          (isAuthorized ?
            <BNDocumentView
              documentPayload={{ documentId, documentVC: data.data.Document, signatures: Object.values(data.data.Signatures), document } as DocumentPayload}
              documentStatus={documentStatus}
            /> :
            <FullView>
              <Text>You Don't Have Access To This Document</Text>
              <Button variant="soft" onPress={disconnect}>
                <Button.Text>Disconnnect</Button.Text>
              </Button>
            </FullView>
          )
        }
      </>
    </>
  );
};

export default Document;