import { Address, Hex } from 'viem'

import { UserOperation } from './UserOperation.js'

export interface SendRawUserOperationInput {
  chainId: bigint
  userOp: UserOperation
}

export interface SendRawUserOperationResponse {
  chainId: bigint
  userOpHash: Hex
}

export interface IBundlerManager {
  verifyConfig (chainId: bigint, entrypoints: Address): Promise<void>

  sendUserOperation (userOp: UserOperation): Promise<Hex>

}
