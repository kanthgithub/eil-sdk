import { Address, PublicClient } from 'viem'

export type ChainInfo = {
  chainId: bigint

  //either publicClient or publicUrl must be provided.
  publicClient: PublicClient
  bundlerUrl?: string // url to send UserOps (if not specified, use publicUrl)
  paymasterAddress: Address
  entryPointAddress?: Address // non-default entrypoint, for testing
}
