import _ from "lodash";
import {schema} from "../blocks/BlockNoteSchema.tsx";
import type { Block } from '../blocks/BlockNoteSchema';
import {Signature} from "../types";

// Split Signatures From Document
// TODO: Need to do a deep search for signature blocks
//       In later phase add signatures to the VC
export const separateSignaturesFromDocument = (documentState: Block[]) => {
    const document = _.cloneDeep(documentState);
    const signatures: Signature[] = [];
    _.filter(document, (block: typeof schema.Block) => block.type === 'signature').forEach((sigBlock: typeof schema.blockSchema.signature) => {
        signatures.push({ blockId: sigBlock.id, name: sigBlock.props.name, address: sigBlock.props.address });
        delete sigBlock.props.name;
        delete sigBlock.props.address;
    });
    console.log(document);
    return { document, signatures };
}
