import { JsonRpcSigner, BrowserProvider, toUtf8String } from 'ethers'
import { TKeyType, IKey, ManagedKeyInfo, MinimalImportableKey } from '@veramo/core-types'
import { AbstractKeyManagementSystem, Eip712Payload } from '@veramo/key-manager'
/**
 * This is a {@link @veramo/key-manager#AbstractKeyManagementSystem | KMS} implementation that uses the addresses of a
 * web3 wallet as key identifiers, and calls the respective wallet for signing operations.
 * @beta
 */
export class Web3KeyManagementSystem extends AbstractKeyManagementSystem {
  /**
   *
   * @param providers - the key can be any unique name.
   * Example `{ metamask: metamaskProvider, walletConnect: walletConnectProvider }`
   */
  constructor(private providers: Record<string, BrowserProvider>) {
    super()
  }

  createKey(_args: { type: TKeyType }): Promise<ManagedKeyInfo> {
    throw Error('not_supported: Web3KeyManagementSystem cannot create new keys')
  }

  async importKey(args: Omit<MinimalImportableKey, 'kms'>): Promise<ManagedKeyInfo> {
    // throw Error('Not implemented')
    return args as any as ManagedKeyInfo
  }

  async listKeys(): Promise<ManagedKeyInfo[]> {
    const keys: ManagedKeyInfo[] = []
    for (const provider in this.providers) {
      const accounts = await this.providers[provider].listAccounts()
      for (const account of accounts) {
        const key: ManagedKeyInfo = {
          kid: `${provider}-${account}`,
          type: 'Secp256k1',
          publicKeyHex: '',
          kms: '',
          meta: {
            account,
            provider,
            algorithms: ['eth_signMessage', 'eth_signTypedData'],
          },
        }
        keys.push(key)
      }
    }
    return keys
  }

  async sharedSecret(_args: {
    myKeyRef: Pick<IKey, 'kid'>
    theirKey: Pick<IKey, 'type' | 'publicKeyHex'>
  }): Promise<string> {
    throw Error('not_implemented: Web3KeyManagementSystem sharedSecret')
  }

  async deleteKey(_args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  // keyRef should be in this format '{providerName-account}
  // example: 'metamask-0xf3beac30c498d9e26865f34fcaa57dbb935b0d74'
  private async getAccountAndSignerByKeyRef(keyRef: Pick<IKey, 'kid'>): Promise<{ account: string; signer: JsonRpcSigner }> {
    const providerName = (keyRef as IKey).kms;
    const account = (keyRef as IKey).kid
    if (!this.providers[providerName]) {
      throw Error(`not_available: provider ${providerName}`)
    }
    const signer = await this.providers[providerName].getSigner(account)
    return { account, signer }
  }

  async sign({
    keyRef,
    algorithm,
    data,
  }: {
    keyRef: Pick<IKey, 'kid'>
    algorithm?: string
    data: Uint8Array
  }): Promise<string> {
    if (algorithm) {
      if (algorithm === 'eth_signMessage') {
        return await this.eth_signMessage(keyRef, data)
      } else if (['eth_signTypedData', 'EthereumEip712Signature2021'].includes(algorithm)) { // This comes from the @veramo/kms-web3 library
        return await this.eth_signTypedData(keyRef, data)
      }
    }

    throw Error(`not_supported: Cannot sign ${algorithm} `)
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed EIP712 data
   */
  private async eth_signTypedData(keyRef: Pick<IKey, 'kid'>, data: Uint8Array) {
    let msg, msgDomain, msgTypes;
    const serializedData = toUtf8String(data)
    try {
      const jsonData = JSON.parse(serializedData) as Eip712Payload
      if (typeof jsonData.domain === 'object' && typeof jsonData.types === 'object') {
        const { domain, types, message } = jsonData
        msg = message
        msgDomain = domain
        msgTypes = types
      } else {
        // next check will throw since the data couldn't be parsed
      }
    } catch (e) {
      // next check will throw since the data couldn't be parsed
    }
    if (typeof msgDomain !== 'object' || typeof msgTypes !== 'object' || typeof msg !== 'object') {
      throw Error(
        `invalid_arguments: Cannot sign typed data. 'domain', 'types', and 'message' must be provided`,
      )
    }
    delete msgTypes.EIP712Domain

    const { signer } = await this.getAccountAndSignerByKeyRef(keyRef)
    const signature = await signer.signTypedData(msgDomain, msgTypes, msg)

    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed message
   */
  private async eth_signMessage(keyRef: Pick<IKey, 'kid'>, rawMessageBytes: Uint8Array) {
    const { signer } = await this.getAccountAndSignerByKeyRef(keyRef)
    const signature = await signer.signMessage(rawMessageBytes)
    // HEX encoded string, 0x prefixed
    return signature
  }
}