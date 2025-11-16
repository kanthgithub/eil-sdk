import { encodeFunctionData, Hex, keccak256, sliceHex, toBytes } from 'viem'

import AtomicSwapTypes
  from '@eil-protocol/contracts/artifacts/src/common/utils/AtomicSwapTypes.sol/AtomicSwapTypes.json' with { type: 'json' }
import { DestinationVoucherRequestsData } from '../contractTypes/DestinationVoucherRequestsData.js'
import { EmptySessionData, SessionData } from '../contractTypes/SessionData.js'
import { Voucher } from '../contractTypes/Voucher.js'
import { VoucherRequest } from '../contractTypes/VoucherRequest.js'

export function getVoucherRequestId (atomicSwap: VoucherRequest): `0x${string}` {
  const message: string = abiEncodeAtomicSwapForSigning(atomicSwap)
  return keccak256(toBytes(message))
}

export function abiEncodeVouchers (vouchers: Voucher[], sessionData: SessionData = EmptySessionData): Hex {
  const data: Hex = encodeFunctionData({
    abi: AtomicSwapTypes.abi,
    functionName: 'getVouchers',
    args: [vouchers, sessionData]
  });
  return sliceHex(data, 4)
}

/**
 * @notice Here only the 'data' bytes are passed to encoding, as the results will be used to create an ephemeral signature.
 * @param vouchers
 * @param sessionData
 */
export function abiEncodeVouchersForEphemeralSigning (vouchers: Voucher[], sessionData: Hex): Hex {
  const data: Hex = encodeFunctionData({
    abi: AtomicSwapTypes.abi,
    functionName: 'getVouchersForEphemeralSigning',
    args: [vouchers, sessionData]
  });
  return sliceHex(data, 4)
}

/**
 * ABI-encode the {@link VoucherRequest} - the shared part of the paymaster data across layers.
 *
 * @notice On the destination chain the real paymaster data also includes the xlp's signed Voucher.
 * @param voucherRequest
 */
export function abiEncodeAtomicSwapForSigning (voucherRequest: VoucherRequest) {
  const enc: Hex = encodeFunctionData({
    abi: AtomicSwapTypes.abi,
    functionName: 'getVoucherRequest',
    args: [voucherRequest]
  })
  return sliceHex(enc, 4) // remove selector
}

/**
 * ABI-encode the entire Paymaster data for UserOperations on either layer.
 *
 * @param voucherRequestsDest
 */
export function abiEncodePaymasterData (
  voucherRequestsDest: DestinationVoucherRequestsData
) {
  const data: Hex = encodeFunctionData({
    abi: AtomicSwapTypes.abi,
    functionName: 'getVoucherRequests',
    args: [voucherRequestsDest]
  })
  return sliceHex(data, 4) // remove selector
}
