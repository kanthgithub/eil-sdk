import { Address, encodeFunctionData, PublicClient, toHex } from "viem";

import { TestERC20Meta } from '../../abitypes/abiTypes.js'
import { IMultiChainEntity, MultichainToken, toAddress } from '../types/index.js'

type StructLog = {
  op: string;
  stack: any[];
  depth: number;
}

interface DebugTraceResponse {
  structLogs: StructLog[]
}

/**
 * utility function (on forked chains)
 * Sets the balance of a token for a given account.
 * This method works with any token.
 * It uses a debug trace to find the storage slot of the balance,
 * the last SLOAD is the slot of the account's storage
 * and then uses `hardhat_setStorageAt` to set the value.
 *
 * @param chain - the public client to use for the request
 * @param token - the token to set the balance for
 * @param account - the account (or address) to set the balance for
 * @param amount - the amount to set (in wei)
 */
export async function debugSetTokenAmount (
  chain: PublicClient,
  token: MultichainToken | Address,
  account: IMultiChainEntity | Address,
  amount: bigint
): Promise<void> {
  const chainId = BigInt(await chain.getChainId())

  const tokenAddress = toAddress(chainId, token)
  const accountAddress = toAddress(chainId, account)

  //try using tenderly api:
  try {
    const resp = await chain.request({
      method: "tenderly_setErc20Balance" as any,
      params: [
        tokenAddress,
        accountAddress,
        toHex(amount)
      ]
    })
    return
  } catch (error: any) {
    if (!error.toString().includes('MethodNotFoundRpcError')) {
      throw error
    }
  }

  const encodeBalanceOf = encodeFunctionData({
    abi: TestERC20Meta.abi,
    functionName: 'balanceOf',
    args: [accountAddress]
  })
  const resp = await chain.request({
    method: "debug_traceCall" as any,
    params: [{
      to: tokenAddress,
      data: encodeBalanceOf
    }, 'latest']
  }) as DebugTraceResponse
  const structLogs: StructLog[] = resp.structLogs || [];
  const sloads = structLogs.filter((log: StructLog) => log.op === 'SLOAD')
  if (sloads.length == 0) {
    throw new Error("No SLOAD found in the trace for balanceOf");
  }
  const last = sloads[sloads.length - 1]
  // The last SLOAD operation should correspond to reading the account's balance storage slot
  const storageSlot = last.stack[last.stack.length - 1]
  const valHex = toHex(amount, { size: 32 })
  await chain.request({
    method: "hardhat_setStorageAt" as any,
    params: [tokenAddress, storageSlot, valHex]
  })
}
