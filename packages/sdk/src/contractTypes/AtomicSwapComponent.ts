import { Address } from "viem";

import { Asset } from './Asset.js'
import { AtomicSwapFeeRule } from "./AtomicSwapFeeRule.js";

export interface SourceSwapComponent {
  chainId: bigint
  sender: Address
  paymaster: Address
  assets: Asset[]
  feeRule: AtomicSwapFeeRule
  senderNonce: bigint
  allowedXlps: Address[]
}

export interface DestinationSwapComponent {
  chainId: bigint
  sender: Address
  paymaster: Address
  assets: Asset[]
  maxUserOpCost: bigint
  expiresAt: bigint
}
