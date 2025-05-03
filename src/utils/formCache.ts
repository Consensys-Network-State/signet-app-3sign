import { Document } from '../store/documentStore';

const CACHE_PREFIX = 'document';

export const formCache = {
  getKey: (documentId: string) => `${CACHE_PREFIX}_${documentId}_values`,

  get: (documentId: string): Record<string, string> => {
    if (!documentId) return {};
    
    const storedValues = localStorage.getItem(formCache.getKey(documentId));
    return storedValues ? JSON.parse(storedValues) : {};
  },

  set: (documentId: string, values: Record<string, any>) => {
    if (!documentId || !values) return;
    localStorage.setItem(formCache.getKey(documentId), JSON.stringify(values));
  },

  remove: (documentId: string) => {
    if (!documentId) return;
    localStorage.removeItem(formCache.getKey(documentId));
  },

  getInitialValues: (documentId: string | undefined, document: Document | null): Record<string, string> => {
    if (!documentId || !document) return {};
    
    // Try to get cached values first
    const cachedValues = formCache.get(documentId);
    if (Object.keys(cachedValues).length > 0) {
      return cachedValues;
    }

    // If no cached values, extract from document variables
    return Object.entries(document.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: variable.value || ''
    }), {} as Record<string, string>);
  }
}; 