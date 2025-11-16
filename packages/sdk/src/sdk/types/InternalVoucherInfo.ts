import { BatchBuilder } from '../builder/BatchBuilder.js'
import { SdkVoucherRequest } from './SdkVoucherRequest.js'
import { Voucher } from '../../contractTypes/Voucher.js'
import { VoucherRequest } from '../../contractTypes/VoucherRequest.js'
import { Address } from 'viem'

export interface InternalVoucherInfo {
  voucher: SdkVoucherRequest
  sourceBatch: BatchBuilder
  destBatch?: BatchBuilder
  // list of XLPs allowed to sign this voucher
  allowedXlps?: Address[]
  voucherRequest?: VoucherRequest
  // the signed voucher, filled once a provider signs it
  signedVoucher?: Voucher
}
