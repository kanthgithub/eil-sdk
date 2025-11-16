import { MultichainContract } from '../types/index.js'
import { MultichainClient } from '../types/index.js'
import { EntryPointMeta, ICrossChainPaymaster } from '../../abitypes/abiTypes.js'
import { entryPoint09Address } from '../types/Constants.js'
import { CrossChainConfig } from '../config/index.js'
import { getMultiChainConfig } from './GetMultiChainConfig.js'

/**
 * Parses input configuration into configuration objects used by the builder and executor.
 * This includes setting up chain clients, paymasters, bundlers, and entry points across multiple chains.
 * @see {CrossChainConfig} for input configuration structure.
 */
export class InternalConfig {

  readonly chains: MultichainClient
  readonly paymasters: MultichainContract
  readonly entrypoints: MultichainContract

  constructor (
    readonly input: CrossChainConfig
  ) {
    this.chains = new MultichainClient()
    const chains = getMultiChainConfig(this.input.chainsInfoOverride)

    chains.forEach(chain => {
      this.chains.addClientWithChainId(chain.publicClient, BigInt(chain.chainId))
    })
    this.paymasters = new MultichainContract(this.chains, ICrossChainPaymaster.abi)
    chains.forEach(chain =>
      this.paymasters.addAddress(chain.chainId, chain.paymasterAddress))

    this.entrypoints = new MultichainContract(this.chains, EntryPointMeta.abi)
    chains.forEach(chain => {
      const entryPointAddress = chain.entryPointAddress ?? entryPoint09Address
      this.entrypoints.addAddress(chain.chainId, entryPointAddress)
    })
  }
}

