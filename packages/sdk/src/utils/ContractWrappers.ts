import { ContractReturnType } from "@nomicfoundation/hardhat-viem/types";
import { Address, Client, getContract } from "viem";

import { EntryPointMeta, ICrossChainPaymaster, TestERC20Meta } from "../abitypes/abiTypes.js";

export type ICrossChainPaymasterType = ContractReturnType<'ICrossChainPaymaster'> | any
export type TestERC20Type = ContractReturnType<'TestERC20'> | any
export type IEntryPointType = ContractReturnType<'EntryPointMeta'> | any

export function getEntryPoint (client: Client, address: Address): IEntryPointType {
  return getContract({
    abi: EntryPointMeta.abi,
    address,
    client
  }) as any
}

export function getICrossChainPaymaster (client: Client, address: Address): ICrossChainPaymasterType {
  return getContract({
    abi: ICrossChainPaymaster.abi,
    address,
    client
  }) as any
}


export function getTestErc20Token (client: Client, address: Address): TestERC20Type {
  return getContract({
    abi: TestERC20Meta.abi,
    address,
    client
  }) as any
}
