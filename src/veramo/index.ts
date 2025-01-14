import { DIDManager } from '@veramo/did-manager';
import { KeyManager } from '@veramo/key-manager';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { PkhDIDProvider } from '@veramo/did-provider-pkh';
import { KeyStore } from './plugins/KeyStore';
import { createAgent } from '@veramo/core';
import { ethers } from 'ethers';
import { Web3KeyManagementSystem } from './plugins/KMS';
import { DIDStore } from './plugins/DIDStore';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as pkhDidResolver } from 'pkh-did-resolver';
import { CredentialIssuerEIP712 } from '@veramo/credential-eip712';

// Configure Veramo agent
export async function setupAgent() {

  // Detect MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []); // Request accounts

  const didProvider = new PkhDIDProvider({
    defaultKms: 'metamask',
  });

  const agent = createAgent({
    plugins: [
      new KeyManager({
        store: new KeyStore(),
        kms: {
          metamask: new Web3KeyManagementSystem({ metamask: provider }),
        },
      }),
      new DIDManager({
        store: new DIDStore(accounts),
        providers: {
          'did:pkh': didProvider,
        },
        defaultProvider: 'did:pkh',
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...pkhDidResolver(),
        }),
      }),
      new CredentialPlugin(),
      new CredentialIssuerEIP712(),
    ],
  });

  return agent;
}