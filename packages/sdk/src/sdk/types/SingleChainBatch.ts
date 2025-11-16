import { SdkVoucherRequest } from './SdkVoucherRequest.js'
import { UserOperation } from './UserOperation.js'
import { Hex } from 'viem'

/**
 * A set of operations executed on a single chain by the account.
 * These actions are ultimately packed into a single UserOperation.
 */
export interface SingleChainBatch {
  /** Target chain to run this UserOperation */
  chainId: bigint

  /** The constructed UserOperation */
  userOp: UserOperation

  userOpHash: Hex

  /** List of input voucher requests to collect before executing all actions */
  inputVoucherRequests: SdkVoucherRequest[]

  /** List of outputs: vouchers to generate after execution of all actions */
  outVoucherRequests: SdkVoucherRequest[]
}
