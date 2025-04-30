import { v4 as uuidv4 } from "uuid";
import { setupAgent } from "../veramo";
import { ethers } from 'ethers';
import { Block } from "../blocks/BlockNoteSchema.tsx";
import { Document } from "../store/documentStore";
import { separateSignaturesFromDocument } from "./documentUtils.ts";

export const encodeObjectToBase64 = (obj: any) => {
  try {
    const jsonString = JSON.stringify(obj); // Convert object to JSON string
    const utf8String = new TextEncoder().encode(jsonString); // Convert to UTF-8 encoded Uint8Array
    return btoa(String.fromCharCode(...utf8String)); // Convert Uint8Array to Base64 string
  } catch (error) {
    console.error("Failed to encode object to Base64:", error);
    return null;
  }
};

export const decodeBase64ToObject = (base64String: string) => {
  try {
    const utf8String = atob(base64String); // Decode Base64 to string
    const jsonString = new TextDecoder().decode(new Uint8Array([...utf8String].map((c) => c.charCodeAt(0))));
    return JSON.parse(jsonString); // Parse JSON string back to an object
  } catch (error) {
    console.error("Failed to decode Base64 to object:", error);
    return null;
  }
};

export async function getDIDFromAddress(address: `0x${string}`) {
  const agent = await setupAgent();
  return await agent.didManagerGet({did: `did:pkh:eip155:1:${address}`});
}

export async function signVCWithEIP712(credential: any) {
  const agent = await setupAgent();

  const vc = await agent.createVerifiableCredential({
    credential,
    proofFormat: 'EthereumEip712Signature2021',
  });
  const verificationResult = await agent.verifyCredential({ credential: vc });
  if (!verificationResult.verified) throw new Error('Failed to sign with wallet');
  return vc;
}
export async function createDocumentVC(address: `0x${string}`, signatories: `0x${string}`[], documentState: Block[]) {
  const { document } = separateSignaturesFromDocument(documentState);

  const did = await getDIDFromAddress(address);

  const vc = await signVCWithEIP712(
    {
      id: uuidv4(),
      issuer: { id: did.did },
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: [
        'VerifiableCredential',
        'Agreement',
      ],
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did.did,
        document: encodeObjectToBase64(document),
        timeStamp: new Date().toISOString(),
        signatories,
      },
    }
  );
  return JSON.stringify(vc);
}

export async function createAgreementInitVC(address: `0x${string}`, agreement: Document, params: Record<string, string>) {
  const agent = await setupAgent();
  const did = await agent.didManagerGet({did: `did:pkh:eip155:1:${address}`});

  // Filter out empty keys or keys with empty string values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== null && value !== undefined && value !== '')
  );

  const credential = {
    id: uuidv4(),
    issuer: { id: did.did },
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: [
      'VerifiableCredential',
      'Agreement',
    ],
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: did.did,
      agreement: encodeObjectToBase64(agreement),
      params: filteredParams
    },
  }
  const vc = await agent.createVerifiableCredential({
    credential,
    proofFormat: 'EthereumEip712Signature2021',
  });
  const verificationResult = await agent.verifyCredential({ credential: vc });
  if (!verificationResult.verified) throw new Error('Failed to sign with wallet');
  return JSON.stringify(vc);
}

export async function createSignatureVC(address: `0x${string}`, documentState: Block[], documentVC: string) {
  const { signatures } = separateSignaturesFromDocument(documentState);
  const did = await getDIDFromAddress(address);

  // Construct VC from this
  const vc = await signVCWithEIP712(
    {
      id: uuidv4(),
      issuer: {id: did.did},
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: [
        'VerifiableCredential',
        'SignedAgreement',
      ],
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did.did,
        documentHash: ethers.keccak256(new TextEncoder().encode(documentVC)),
        timeStamp: new Date().toISOString(),
        signatureBlocks: JSON.stringify(signatures),
      },
    }
  );
  return JSON.stringify(vc);
}

export async function validateAndProcessDocumentVC(vc: any) {
  const agent = await setupAgent();
  const verificationResult = await agent.verifyCredential({ credential: vc });
  if (!verificationResult.verified) throw new Error('Failed to validate document');
  // How do we check if the issuer of the VC is the correct person
  return {
    document: decodeBase64ToObject(vc.credentialSubject.document) as Block[],
    signatories: vc.credentialSubject.signatories,
  }
}