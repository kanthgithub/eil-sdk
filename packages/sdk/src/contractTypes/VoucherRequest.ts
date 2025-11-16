import { DestinationSwapComponent, SourceSwapComponent } from './AtomicSwapComponent.js'

export interface VoucherRequest {
  origination: SourceSwapComponent
  destination: DestinationSwapComponent
}
