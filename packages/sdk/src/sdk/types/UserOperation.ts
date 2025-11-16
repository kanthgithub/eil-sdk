import { Address, Hex } from 'viem'

export interface UserOperation {
  sender: Address
  nonce: bigint
  factory?: Address
  factoryData?: Hex
  callData: Hex
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymaster?: Address
  paymasterVerificationGasLimit?: bigint
  paymasterPostOpGasLimit?: bigint
  paymasterData?: Hex
  paymasterSignature?: Hex
  signature: Hex

  // these fields are not encoded explicitly into the PackedUserOp,
  //  but they do affect the hash, as they are encoded as part of the EIP-712 domain
  chainId?: bigint
  entryPointAddress?: Address
}
