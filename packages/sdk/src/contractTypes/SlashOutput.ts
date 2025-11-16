import { Address, Hex } from 'viem'

import { DisputeType } from './DisputeType.js'

export type SlashOutputStruct = {
  l2XlpAddressToSlash: Address
  requestIdsHash: Hex
  originationChainId: bigint
  destinationChainId: bigint
  disputeType: DisputeType
}
