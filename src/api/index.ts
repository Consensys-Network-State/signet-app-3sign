import axios from 'axios';
import { Agreement } from '../store/documentStore';

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

export const getAgreement = async (agreementId: string): Promise<Agreement> => {
  const { data } = await axios.get(`${API_URL}/agreements/${agreementId}`);
  return data;
}

export const postAgreement = async (agreementVC: string) => {
  return await axios.post(`${API_URL}/agreements`, JSON.parse(agreementVC));
}

export const postAgreementInput = async (agreementId: string, inputVC: string) => {
  return await axios.post(`${API_URL}/agreements/${agreementId}/input`, JSON.parse(inputVC));
}

export const getAgreementByUserId = async (userId: string) => {
  return await axios.get(`${API_URL}/agreements?contributor=${userId}`);
}

