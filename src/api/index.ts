import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getDocument = async (documentId: string) => {
    return await axios.get(`${API_URL}/documents/${documentId}`);
}

export const postDocument = async (documentVC: string) => {
    return await axios.post(`${API_URL}/documents`, JSON.parse(documentVC));
}

export const postSignature = async (documentId: string, signatureVC: string) => {
    return await axios.post(`${API_URL}/documents/${documentId}/sign`, JSON.parse(signatureVC));
}

