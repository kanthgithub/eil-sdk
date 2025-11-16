import { concatHex, type Hex, hexToBigInt, size, sliceHex, toHex } from 'viem'
import { getUserOperationHash as viemGetUserOperationHash } from 'viem/account-abstraction'

import { UserOperation } from '../types/UserOperation.js'

const PAYMASTER_SIG_MAGIC: Hex = '0x22e325a297439656'
const PAYMASTER_SIG_MAGIC_LEN: number = 8
const PAYMASTER_SIGNATURE_TRAILER_LEN: number = PAYMASTER_SIG_MAGIC_LEN + 2 // uint16 length + magic

export function getUserOpHash (op: UserOperation): Hex {
  return viemGetUserOperationHash({
    userOperation: withSanitizedPaymasterData(op),
    entryPointAddress: op.entryPointAddress!,
    entryPointVersion: '0.8',
    chainId: Number(op.chainId)
  })
}

export function appendPaymasterSignature (
  paymasterData: Hex,
  paymasterSignature: Hex
): Hex {
  const base: Hex = stripPaymasterSignature(paymasterData ?? '0x')
  const signature: Hex = (paymasterSignature ?? '0x')
  const sigLen: number = size(signature)

  const length2bytes: Hex = toHex(sigLen, { size: 2 })
  return concatHex([
    base,
    signature,
    length2bytes,
    PAYMASTER_SIG_MAGIC
  ])
}

export function getPaymasterDataForSigning (paymasterAndData: Hex): Hex {
  const pmSigLength: number | undefined = getPaymasterSignatureLength(paymasterAndData)
  if (pmSigLength === undefined) {
    return paymasterAndData
  }
  const dataLength: number = size(paymasterAndData)
  return concatHex([
    sliceHex(paymasterAndData, 0, dataLength - pmSigLength - PAYMASTER_SIGNATURE_TRAILER_LEN),
    PAYMASTER_SIG_MAGIC
  ])
}

export const maxUint48: number = (2 ** 48) - 1

export function parseValidationData (validationData: bigint): any {
  const data: Hex = toHex(validationData, { size: 32 })

  const aggregator: string = data.slice(-40)
  let validUntil: number = parseInt(data.slice(-52, -40), 16)
  if (validUntil === 0) {
    validUntil = maxUint48
  }
  const validAfter: number = parseInt(data.slice(2, 14), 16)

  return {
    aggregator,
    validAfter,
    validUntil
  }
}

function withSanitizedPaymasterData (op: UserOperation): UserOperation {
  return {
    ...op,
    paymasterData: getPaymasterDataForSigning(op.paymasterData ?? '0x')
  }
}

function getPaymasterSignatureLength (paymasterAndData: Hex): number | undefined {
  const dataLength: number = size(paymasterAndData)
  const suffixLength: number = PAYMASTER_SIG_MAGIC_LEN

  if (
    dataLength > suffixLength &&
    sliceHex(paymasterAndData, dataLength - suffixLength).toLowerCase() === PAYMASTER_SIG_MAGIC
  ) {
    return Number(
      hexToBigInt(
        sliceHex(paymasterAndData, dataLength - PAYMASTER_SIGNATURE_TRAILER_LEN, dataLength - suffixLength)
      )
    )
  } else {
    return undefined
  }
}

function stripPaymasterSignature (paymasterData: Hex): Hex {
  const pmSigLen: number | undefined = getPaymasterSignatureLength(paymasterData)
  if (pmSigLen === undefined) {
    return paymasterData
  }
  const dataLength: number = size(paymasterData)
  return sliceHex(paymasterData, 0, dataLength - pmSigLen - PAYMASTER_SIGNATURE_TRAILER_LEN)
}
