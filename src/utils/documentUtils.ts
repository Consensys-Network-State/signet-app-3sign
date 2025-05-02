import _ from "lodash";
import { schema, SignatureBlock } from "../blocks/BlockNoteSchema.tsx";
import type { Block } from '../blocks/BlockNoteSchema';
import {DocumentPayload, Signature} from "../types";

// Split Signatures From Document
// TODO: Need to do a deep search for signature blocks
export const separateSignaturesFromDocument = (documentState: Block[]) => {
  const document = _.cloneDeep(documentState);
  const signatures: Signature[] = [];
  _.filter(document, (block: typeof schema.Block) => block.type === 'signature').forEach((sigBlock: typeof schema.blockSchema.signature) => {
    signatures.push({ blockId: sigBlock.id, name: sigBlock.props.name, address: sigBlock.props.address });
    delete sigBlock.props.name;
    delete sigBlock.props.address;
  });
  return { document, signatures };
}

// Reconstruct document with signature blocks added in
// TODO: This only works with 1 signatory. Will need to change if we add support for 2+ signatories.
export const constructBNDocumentFromDocumentPayload = (documentPayload: DocumentPayload) => {
  const document = documentPayload.document;
  try {
    const signatures = JSON.parse(JSON.parse(Object.values(documentPayload.raw.Signatures)[0]).credentialSubject.signatureBlocks);
    signatures.forEach(({ blockId, name, address }: { blockId: string, name: string, address: string }) => {
      const oldBlockIndex = document.findIndex((block) => block.id === blockId);
      const oldBlock = document[oldBlockIndex];
      const newBlock = {
        ...oldBlock,
        props: {
          ...oldBlock.props,
          name,
          address,
        }
      };
      document.splice(oldBlockIndex, 1, newBlock);
    })
  } catch (e: any) {
    // TODO: What to do here?
    console.log('Failed to add signatures');
  }
  return document;
}

// TODO: Temp Hacky Solution. Is there better way to do this?
export const countNumberOfSignatures = (state: Block[]) => {
  const signatureBlocks = _.filter(state, (block: Block) => block.type === "signature");
  return {
    numOfSignedSignatureBlocks: _.filter(state, (block: SignatureBlock) => block.props.name && block.props.address).length,
    numOfSignatureBlocks: signatureBlocks.length
  }
}

export interface TitleChangeHandlerParams {
  title: string;
  blockNoteDraft?: any;
  markdownDraft?: any;
  updateBlockNoteDraftTitle?: (id: string, title: string) => void;
  updateMarkdownDraftTitle?: (id: string, title: string) => void;
}

export const handleTitleChange = ({
  title,
  blockNoteDraft,
  markdownDraft,
  updateBlockNoteDraftTitle,
  updateMarkdownDraftTitle,
}: TitleChangeHandlerParams) => {
  if (blockNoteDraft && updateBlockNoteDraftTitle) {
    updateBlockNoteDraftTitle(blockNoteDraft.id, title);
  } else if (markdownDraft?.id && updateMarkdownDraftTitle) {
    updateMarkdownDraftTitle(markdownDraft.id, title);
  }
  return title;
};
