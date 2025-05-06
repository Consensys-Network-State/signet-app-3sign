import React from "react";
import { useDocumentStore } from "./documentStore";

// Selectors
export function useAgreement(agreementId?: string) {
    return useDocumentStore(
      React.useCallback(
        state => (agreementId ? state.getAgreement(agreementId) : undefined),
        [agreementId]
      )
    );
  } 