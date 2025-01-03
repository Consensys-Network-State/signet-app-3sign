import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import grantAgreement from '../templates/grant-agreement.json';
import {
    Block,
  } from '@blocknote/core';

const useStore = create(
    devtools(
        combine(
            {
                editDocumentState: grantAgreement,
            }, // Initial state
            (set) => ({
                updateEditDocumentState: (updatedDoc: Block[]) => set(() => ({ editDocumentState: updatedDoc }), undefined, 'store/updateEditDocumentState'),
            })
        ),
    )
);

export default useStore;