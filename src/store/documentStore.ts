import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import grantAgreement from '../templates/grant-agreement.json';
import {
    Block,
} from '@blocknote/core';
import _ from 'lodash';

// TODO: Temp Hacky Solution. Is there better way to do this?
const countNumberOfSignatures = (state: Block[]) => {
    const signatureBlocks = _.filter(state, (block: Block) => block.type === "signature");
    return {
      numOfSignedSignatureBlocks: _.filter(state, (block: Block) => block.props.name && block.props.address).length,
      numOfSignatureBlocks: signatureBlocks.length
    }
}

export const useDocumentStore = create(
    devtools(
        combine(
            {
                editDocumentState: grantAgreement,
                signaturesState: {
                    ...countNumberOfSignatures(grantAgreement)
                },
                tempStateStore: null,
            }, // Initial state
            (set) => ({
                updateEditDocumentState: (updatedDoc: Block[]) =>
                    set((state) => ({ editDocumentState: updatedDoc, signaturesState: { ...state.signaturesState, ...countNumberOfSignatures(updatedDoc) }}), undefined, 'documentStore/updateEditDocumentState'),
                backupEditDocumentState: () => 
                    set((state) => ({ tempStateStore: _.cloneDeep(state.editDocumentState) }), undefined, 'documentStore/backupEditDocumentState'),
            })
        ),
    )
);
