import { CrossChainConfig } from './config/index.js'
import { ICrossChainBuilder, ICrossChainSdk, IJsonRpcProvider } from './types/index.js'
import { CrossChainBuilder, InternalConfig } from './builder/index.js'
import { IMultiChainSmartAccount } from './account/index.js'

/**
 * This class is the main component for building cross-chain actions.
 * It holds the configuration and is used to create the {@link BatchBuilder}.
 */
export class CrossChainSdk implements ICrossChainSdk {

  config: InternalConfig

  constructor (
    readonly account: IMultiChainSmartAccount,
    config: CrossChainConfig,
    readonly walletProvider: IJsonRpcProvider | undefined = undefined
  ) {
    this.config = new InternalConfig(config)
  }

  /**
   * create a builder for a cross-chain operation
   */
  createBuilder (): ICrossChainBuilder {
    return new CrossChainBuilder(this.config, this.account)
  }
}

