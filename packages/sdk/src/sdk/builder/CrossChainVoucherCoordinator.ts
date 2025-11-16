import { InternalVoucherInfo, SdkVoucherRequest } from '../types/index.js'
import { Address } from 'viem'

export class CrossChainVoucherCoordinator {

  /**
   * A mapping from the inputs of the Builder to the full voucher requests information for all batches.
   */
  private vouchersInternalInfo: Map<SdkVoucherRequest, InternalVoucherInfo> = new Map()

  getAllVoucherInternalInfos (): InternalVoucherInfo[] {
    return [...this.vouchersInternalInfo.values()]
  }

  getVoucherInternalInfo (sdkVoucherRequest: SdkVoucherRequest): InternalVoucherInfo | undefined {
    return this.vouchersInternalInfo.get(sdkVoucherRequest)
  }

  getAllOutVoucherRequests (): SdkVoucherRequest[] {
    return Array.from(this.vouchersInternalInfo.keys())
  }

  has (sdkVoucherRequest: SdkVoucherRequest): boolean {
    return this.vouchersInternalInfo.has(sdkVoucherRequest)
  }

  set (sdkVoucherRequest: SdkVoucherRequest, internalVoucherInfo: InternalVoucherInfo): void {
    this.vouchersInternalInfo.set(sdkVoucherRequest, internalVoucherInfo)
  }

  updateVoucherXlps (voucherReq: SdkVoucherRequest, xlps: Address[]) {
    const info = this.vouchersInternalInfo.get(voucherReq)
    if (!info) {
      throw new Error(`Voucher request ${voucherReq} not found in action builder`)
    }
    info.allowedXlps = xlps
  }
}
