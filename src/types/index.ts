// TODO: Change Later as needed
import {Block} from "../blocks/BlockNoteSchema.tsx";

export interface Signature {
    blockId: string,
    name: string,
    address: string,
}

export interface DocumentPayload {
    documentId: string;
    documentVC: string;
    signatures: string[];
    document: Block[];
}