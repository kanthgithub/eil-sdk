import { Address } from 'viem'
import { MultichainToken } from '../types/index.js'

/**
 * Configuration policy for selecting XLPs for voucher requests
 */
export type XlpSelectionConfig = {
  // list of preferred providers, that are always added first.
  preferredXlps?: Address[]

  depositReserveFactor?: number //factor on XLP's deposit compared to requested amount (default=2)
  includeBalance?: boolean // if true, consider XLP balance as well as deposit (default=true)
  minXlps?: number //if set, require at least that many XLPs on destination network (default=1)
  maxXlps?: number // maximum number of XLPs add to a voucher (default=MAX_ALLOWED_XLPS=20)
  customXlpFilter?: XlpFilter //if set, call this function for each XLP candidate. If it returns false, ignore the XLP
}


/**
 * Maximum number of XLPs to allow for a voucher.
 * We limit this to avoid excessive gas costs when creating the voucher request.
 */
const MAX_ALLOWED_XLPS = 20

export type XlpFilter = (chainId: bigint, addr: Address, token: Address, deposit: bigint, balance: bigint) => Promise<boolean>

export const defaultXlpSelectionConfig = {
  depositReserveFactor: 2,
  includeBalance: true,
  minXlps: 1,
  maxXlps: MAX_ALLOWED_XLPS,
}
