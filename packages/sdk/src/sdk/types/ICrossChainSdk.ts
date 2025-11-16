import { ICrossChainBuilder } from './ICrossChainBuilder.js'

/**
 * CrossChainSdk is the main entry point for building cross-chain actions.
 * holds the configuration, and used to create the BatchBuilder
 */
export interface ICrossChainSdk {

  /**
   * create a builder for a cross-chain operation
   */
  createBuilder (): ICrossChainBuilder
}

