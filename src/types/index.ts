// TODO: Change Later as needed
import {Block} from "../blocks/BlockNoteSchema.tsx";

export interface Signature {
    blockId: string,
    name: string,
    address: string,
}

export interface Document {
    Document: string;
    DocumentHash: string;
    DocumentOwner: `0x${string}`;
    IsComplete: boolean;
    Signatories: `0x${string}`[];
    Signatures: Map<string, string>;
}

export interface DocumentPayload {
    documentId: string;
    document: Block[];
    raw: Document;
}