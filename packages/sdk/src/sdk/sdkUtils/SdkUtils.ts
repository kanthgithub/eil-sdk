import { Address, Call, encodeFunctionData, toHex } from 'viem'

/*
import { BatchStatusInfo } from './types/BatchStatusInfo.js'
import { CrossChainExecutor } from './CrossChainExecutor.js'

export function dumpVouchers(exec: CrossChainExecutor, batchStatusInfos: BatchStatusInfo[]) {
  // dump all voucher statuses:
  console.log('Vouchers status:')
  for (const batchInfo of batchStatusInfos) {
    console.log('--', batchInfo.index, 'chain', batchInfo.batch.chainId, 'status', batchInfo.status)
    for (const req of batchInfo.batch.inputVoucherRequests) {
      const voucherInfo = exec.builder.getVoucherInternalInfo(req)
      const {sender, senderNonce} = voucherInfo.voucherRequest?.origination!
      console.log('--', batchInfo.index, 'chain', batchInfo.batch.chainId, 'status', batchInfo.status, `${sender}/${senderNonce}`, voucherInfo.signedVoucher != undefined)
    }
    for (const req of batchInfo.batch.outVoucherRequests) {
      const voucherInfo = exec.builder.getVoucherInternalInfo(req)
      const {sender, senderNonce} = voucherInfo.voucherRequest?.origination!
      console.log('--', batchInfo.index, batchInfo.batch.chainId, 'output', '->', `${sender}/${senderNonce}`)
    }
  }
  console.log('done status')
}
/**/

export function encodeAbiCall (to: Address, abi: readonly any[], functionName: string, args: any[], value?: bigint): Call {
  const data = encodeFunctionData({ abi, functionName, args })
  return { to, data, value }
}

export const stringifyBigIntReplacer = (_: any, value: any) => typeof value === 'bigint' ? toHex(value) : value;

export function assert (condition: boolean, message: string = 'Assertion failed'): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
