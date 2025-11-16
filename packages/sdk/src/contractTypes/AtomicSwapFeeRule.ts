export interface AtomicSwapFeeRule {
  startFeePercentNumerator: bigint
  maxFeePercentNumerator: bigint
  feeIncreasePerSecond: bigint
  unspentVoucherFee: bigint
}
