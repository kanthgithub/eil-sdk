import { Address } from 'viem'
import { XlpSelectionConfig } from './XlpSelectionConfig.js'
import { FeeConfig } from './FeeConfig.js'
import { ChainInfo } from './ChainInfo.js'
import { PaymasterActions } from 'viem/account-abstraction'

// general config of the CrossChainSdk
export type CrossChainConfig = {

  // Voucher must be fulfilled within this time window
  expireTimeSeconds: number
  xlpSelectionConfig?: XlpSelectionConfig
  feeConfig?: FeeConfig

  /**
   * If set, use this information on a source chain (that is, a chain that
   * is not a destination of a token transfer)
   */
  sourcePaymaster?: PaymasterActions

  //execution calls time-out after this time
  execTimeoutSeconds: number

  /**
   * override default chain configuration (urls and contracts)
   */
  chainsInfoOverride?: ChainInfo[]
}
