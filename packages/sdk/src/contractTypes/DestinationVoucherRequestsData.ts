import { Asset } from './Asset.js'

export interface DestinationVoucherRequestsData {
  vouchersAssetsMinimums: Asset[][]
  ephemeralSigner: string
}
