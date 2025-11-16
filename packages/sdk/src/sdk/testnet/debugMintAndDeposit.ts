//mint tokens, and deposit them for the provider in the paymaster
import { Address, PublicClient } from "viem";

import { debugSetTokenAmount, MultichainToken, toAddress } from "../index.js";

import {
  getICrossChainPaymaster,
  getTestErc20Token,
  ICrossChainPaymasterType,
  TestERC20Type
} from "../../utils/index.js";
import { getMasterAccount } from "./exec.js";

/**
 * mint tokens, and deposit them for the provider in the paymaster.
 * This method is for forked testnets:  it requires debugSetTokenAmount() which uses hardhat/anvil internal storage APIs
 * @param publicClient
 * @param paymasterAddress
 * @param providerAddress
 * @param mcToken
 * @param amount
 */
export async function debugMintAndDeposit (
  publicClient: PublicClient,
  paymasterAddress: Address,
  providerAddress: Address,
  token: MultichainToken | Address,
  amount: bigint
): Promise<void> {
  const chainId: bigint = BigInt(await publicClient.getChainId())

  const account: Address = await getMasterAccount(publicClient)

  const tokenAddress = toAddress(chainId, token)
  const paymaster: ICrossChainPaymasterType = getICrossChainPaymaster(publicClient, paymasterAddress)
  const tokenContract: TestERC20Type = getTestErc20Token(publicClient, tokenAddress)

  const currentDeposit: bigint = await paymaster.read.tokenBalanceOf([tokenAddress, providerAddress])

  if (currentDeposit > amount / 2n) {
    console.log(`current deposit ${currentDeposit}. NOT minting more.`)
  }
  //"mint" some mcToken
  await debugSetTokenAmount(publicClient, token, account, amount)
  await tokenContract.write.approve([paymasterAddress, amount], { account })
  await paymaster.write.tokenDepositToXlp([tokenAddress, providerAddress, amount], { account })
}
