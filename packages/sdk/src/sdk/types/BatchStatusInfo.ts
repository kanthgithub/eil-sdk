import { SingleChainBatch } from './SingleChainBatch.js'
import { Hex } from 'viem'

//internal status of a UserOperation execution
export enum OperationStatus {
  //cannot be executed yet, waiting for vouchers.
  Pending = 'pending',
  // submitted for execution
  Executing = 'executing',
  // execution completed
  Done = 'done',
  // execution reverted
  Failed = 'failed'
}

/**
 * Information about the status of a single chain batch operation.
 */
export interface BatchStatusInfo {
  /** Index position in the input array */
  index: number
  /** Batch of operations to execute on a single chain */
  batch: SingleChainBatch
  /** Current status of the operation */
  status: OperationStatus

  txHash?: Hex

  requestIds?: Hex[]

  /** Revert reason string if status is 'failed', collected from UserOperationRevertReason event */
  revertReason?: string
}
