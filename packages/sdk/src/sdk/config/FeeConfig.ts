/**
 * define the fee policy to be used for voucher requests.
 * fees are always defined as percentage from the first token in the voucher request.
 * @param
 */
export type FeeConfig = {
  // initial fee, as percentage of the first token in the voucher.
  startFeePercent: number

  // maximum fee, as percentage of the first token in the voucher.
  maxFeePercent: number

  // how fast the fee increases over time
  feeIncreasePerSecond: number

  // fee charged on unspent vouchers.
  unspentVoucherFeePercent: number
}

export const defaultFeeConfig: FeeConfig = {
  startFeePercent: 0,
  maxFeePercent: 0,
  feeIncreasePerSecond: 0,
  unspentVoucherFeePercent: 0,
}
