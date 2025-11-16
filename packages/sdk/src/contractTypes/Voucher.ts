import { WalletClient } from '@nomicfoundation/hardhat-viem/types'
import { Address, encodeFunctionData, Hex, maxUint256, sliceHex, zeroAddress } from 'viem'

import { AtomicSwapTypes } from '../abitypes/abiTypes.js'
import { getVoucherRequestId , addressOf } from '../utils/index.js'

import { DestinationSwapComponent } from './AtomicSwapComponent.js'
import { VoucherRequest } from './VoucherRequest.js'
import { VoucherType } from './VoucherType.js'
// convenience for tests: build a voucher from a request and options


export interface Voucher {
  requestId: `0x${string}`
  originationXlpAddress: `0x${string}`
  expiresAt: bigint
  voucherType: VoucherType
  xlpSignature: Address
  voucherRequestDest: DestinationSwapComponent;
}

export const EmptyVoucher: Voucher = {
  voucherRequestDest: {
    chainId: 0n,
    sender: zeroAddress,
    paymaster: zeroAddress,
    assets: [],
    maxUserOpCost: 0n,
    expiresAt: 0n
  },
  requestId: `0x${'00'.repeat(32)}`,
  originationXlpAddress: zeroAddress,
  expiresAt: maxUint256,
  xlpSignature: '0x',
  voucherType: VoucherType.STANDARD
}

//either LocalAccount or WalletClient
export type SignerAccount = {
  signMessage: (params: { message: { raw: Hex } }) => Promise<Hex>
}

export async function signAtomicSwapVoucher (signer: SignerAccount, voucher: Voucher, voucherRequest: VoucherRequest): Promise<Hex> {
  const message: Hex = encodeForSigning(voucher, voucherRequest)
  return await signer.signMessage({ message: { raw: message } })
}

export function encodeForSigning (voucher: Voucher, voucherRequest: VoucherRequest): Hex {
  const data: Hex = encodeFunctionData({
    abi: AtomicSwapTypes.abi,
    functionName: 'getDataForVoucherSignature',
    args: [voucherRequest.destination, voucher.requestId, voucher.originationXlpAddress, voucher.expiresAt, voucher.voucherType]
  })
  return sliceHex(data, 4) // remove selector
}

export async function getVoucherFromRequest (voucherRequest: VoucherRequest, xlpEOA: WalletClient, options: Partial<Voucher> = {}): Promise<Voucher> {
  const requestId: Hex = getVoucherRequestId(voucherRequest)
  const xlpAddressEOA: Hex = addressOf(xlpEOA)
  const voucher: Voucher = {
    requestId,
    voucherRequestDest: voucherRequest.destination,
    originationXlpAddress: (options as any).originationXlpAddress ?? xlpAddressEOA,
    expiresAt: options.expiresAt ?? voucherRequest.destination.expiresAt,
    xlpSignature: '0x',
    voucherType: (options as any).voucherType ?? ((options as any).isVoucherOverride ? VoucherType.OVERRIDE : VoucherType.STANDARD)
  }
  voucher.xlpSignature = await signAtomicSwapVoucher(xlpEOA, voucher, voucherRequest)
  return voucher
}
