import { IIdentifier, IKey } from "@veramo/core";
import { AbstractDIDStore } from "@veramo/did-manager";

export class DIDStore implements AbstractDIDStore {
  private addresses: string[];

  constructor(addresses: string[]) {
    this.addresses = addresses;
  }

  public async getDID({
    did,
    alias
  }: {
    did: string;
    alias: string;
  }): Promise<IIdentifier> {
    return {
      did,
      alias,
      provider: "did:pkh",
      services: [],
      keys: [
        {
          kid: did.replace("did:pkh:eip155:1:", ""),
          type: "Secp256k1",
          kms: "metamask",
          meta: {
            algorithms: ['eth_signTypedData']
          },
          publicKeyHex: "",
        } as IKey,
      ],
    } as IIdentifier;
  }

  public async listDIDs(): Promise<IIdentifier[]> {
    return await Promise.all(
      this.addresses.map(async address => {
        return this.getDID({ did: `did:pkh:eip155:1:${address}`, alias: ""});
      }),
    );
  }

  public async importDID(_args: IIdentifier): Promise<boolean> {
    return false;
  }

  public async deleteDID(_args: { did: string }): Promise<boolean> {
    return false;
  }
}