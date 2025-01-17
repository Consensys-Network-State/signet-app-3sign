import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import grantAgreement from '../templates/grant-agreement.json';
import type { Block, SignatureBlock } from '../blocks/BlockNoteSchema';
import _ from 'lodash';

// TODO: Temp Hacky Solution. Is there better way to do this?
const countNumberOfSignatures = (state: Block[]) => {
    const signatureBlocks = _.filter(state, (block: Block) => block.type === "signature");
    return {
      numOfSignedSignatureBlocks: _.filter(state, (block: SignatureBlock) => block.props.name && block.props.address).length,
      numOfSignatureBlocks: signatureBlocks.length
    }
}

export const useDocumentStore = create(
    devtools(
        combine(
            {
                editDocumentState: grantAgreement as Block[],
                signaturesState: {
                    ...countNumberOfSignatures(grantAgreement as Block[])
                },
                tempStateStore: grantAgreement as Block[],
                signatories: [] as `0x${string}`[],
                signatures: [] as any, // Hold VCs?
            }, // Initial state
            (set) => ({
                updateEditDocumentState: (updatedDoc: Block[]) =>
                    set((state) => ({ editDocumentState: updatedDoc, signaturesState: { ...state.signaturesState, ...countNumberOfSignatures(updatedDoc) }}), undefined, 'documentStore/updateEditDocumentState'),
                setSignatories: (signatories: `0x${string}`[]) =>
                    set(() => ({ signatories: signatories }), undefined, 'documentStore/setSignatories'),
                backupEditDocumentState: () =>
                    set((state) => ({ tempStateStore: _.cloneDeep(state.editDocumentState) }), undefined, 'documentStore/backupEditDocumentState'),
            })
        ),
    )
);
