import { Address } from "viem";

export type ChainInfo = {
  // L2 application endpoint (paymaster/registry)
  paymaster: Address
  // L1 connector address
  l1Connector: Address
  // L2 connector address
  l2Connector: Address
  // Xlp's L2 address
  l2XlpAddress: Address
}
