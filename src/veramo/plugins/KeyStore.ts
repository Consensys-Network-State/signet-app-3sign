import { AbstractKeyStore } from "@veramo/key-manager";
import { IKey } from "@veramo/core";
import { ethers } from "ethers";

function toChecksumAddress(address: string) {
    return ethers.getAddress(address);
}

export class KeyStore implements AbstractKeyStore {
  constructor() {}

  public async getKey(args: { kid: string }): Promise<IKey> {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = (await provider.send("eth_requestAccounts", [])).map(toChecksumAddress);
    if (!accounts.includes(args.kid)) {
      throw Error("Key not found");
    }
    return {
        kid: args.kid,
        // privateKeyHex: hdWallet.privateKey,
        publicKeyHex: args.kid,
        type: "Secp256k1",
        kms: "metamask",
    } as IKey;
  }

  public async importKey(_args: IKey): Promise<boolean> {
    return false;
  }

  public async deleteKey(_args: { kid: string }): Promise<boolean> {
    return false;
  }

  public async listKeys(_args: {}){
      return [];
  }
}