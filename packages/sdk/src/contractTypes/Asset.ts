import { Address } from "viem";

export interface Asset {
  erc20Token: Address
  amount: bigint
}
