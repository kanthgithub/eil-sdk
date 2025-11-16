import { Address, createClient, fromHex, Hex, http } from 'viem'
import { entryPoint08Address } from 'viem/account-abstraction'

import { stringifyBigIntReplacer } from '../sdkUtils/SdkUtils.js'
import { IBundlerManager } from '../types/IBundlerManager.js'
import { ChainInfo } from '../config/index.js'
import { UserOperation } from '../types/UserOperation.js'
import { IJsonRpcProvider } from '../types/index.js'

export class MultichainBundlerManager implements IBundlerManager {
  isInitialized = false

  constructor (readonly chainInfos: ChainInfo[], bundlers: Array<[chainId: bigint, url: string, entryPoint?: Address]> = []) {
    for (const [chainId, url, entryPointAddress] of bundlers) {
      let provider = createClient({
        transport: http(url, { retryCount: 0 })
      }).transport
      this.addBundler(chainId, provider, entryPointAddress ?? entryPoint08Address)
    }
  }

  async initialize (): Promise<void> {
    for (const chain of this.chainInfos) {
      let provider: IJsonRpcProvider
      if (chain.bundlerUrl != null) {
        provider = createClient({
          transport: http(chain.bundlerUrl, { retryCount: 0 })
        }).transport
      } else {
        provider = chain.publicClient.transport
      }
      const entryPointAddress = chain.entryPointAddress ?? entryPoint08Address
      this.addBundler(chain.chainId, provider, entryPointAddress)
    }
    this.isInitialized = true
  }

  bundlers: Map<bigint, IJsonRpcProvider> = new Map()
  entryPoints: Map<bigint, Address> = new Map()

  addBundler (chainId: bigint, provider: IJsonRpcProvider, entryPointAddress: Address) {
    this.bundlers.set(chainId, provider)
    this.entryPoints.set(chainId, entryPointAddress)
  }

  async verifyConfig (chainId: bigint, entryPoint: Address): Promise<void> {
    const bundler = this.bundlers.get(chainId)
    if (bundler == null) {
      throw new Error(`No bundler configured for chain ${chainId}`)
    }
    const bundlerChainId = fromHex(await bundler.request({ 'method': 'eth_chainId' }), 'bigint')
    if (bundlerChainId != chainId) {
      throw new Error(`Bundler for chain ${chainId} is configured with a wrong chainId ${bundlerChainId}`)
    }
    const supportedEntryPoints = await bundler.request({ 'method': 'eth_supportedEntryPoints' }) as Address[]
    if (!supportedEntryPoints.map(addr => addr.toLowerCase()).includes(entryPoint.toLowerCase())) {
      throw new Error(`Bundler for chain ${chainId} does not support EntryPoint at address ${entryPoint}, only ${supportedEntryPoints}`)
    }
  }

  sendUserOperation (userOp: UserOperation): Promise<Hex> {
    if (!this.isInitialized) {
      throw new Error('MultichainBundlerManager is not initialized')
    }
    const provider = this.bundlers.get(userOp.chainId!)!
    if (!provider) {
      throw new Error(`No bundler found for chainId: ${userOp.chainId!}`)
    }
    const jsonUserOp = JSON.parse(JSON.stringify(userOp, stringifyBigIntReplacer))
    return provider.request({
      method: 'eth_sendUserOperation',
      params: [jsonUserOp, this.entryPoints.get(userOp.chainId!)]
    })
  }
}
