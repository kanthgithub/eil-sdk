import {
  Account,
  Address,
  Chain,
  checksumAddress,
  createWalletClient,
  http,
  parseEther,
  PublicClient,
  Transport,
  walletActions,
  WalletClient
} from 'viem'

import { toAccount } from 'viem/accounts'

//assume this client is a local node. use eth_account to get the master account.
// (usable as "from" in eth_sendTransaction. also known to be well funded)
export async function getMasterAccount (client: PublicClient, index: number = 0): Promise<Address> {
  const accounts: any[] = await client.request({ method: 'eth_accounts' as any })
  if (accounts == null || accounts.length === 0) {
    throw new Error(`Node doesn't support "eth_accounts"`)
  }

  return checksumAddress(accounts[index])
}

/**
 * Create a WalletClient from a PublicClient for a testnet account
 * query the "master" account of this chain, and create a WalletClient, so we can make transaction on this chain.
 * @param publicClient - The PublicClient to use for the wallet client.
 * @returns A WalletClient instance.
 */
export async function toWalletClient (publicClient: PublicClient): Promise<WalletClient<Transport, Chain, Account>> {
  return createWalletClient({
    account: toAccount(await getMasterAccount(publicClient)),
    chain: publicClient.chain!,
    transport: http()
  })
}

//fund account (from master accounts[0]).
// do nothing if balance at least half..
export async function fund (publicClient: PublicClient, target: Address, amount: bigint = parseEther('1.0')): Promise<void> {
  if (await publicClient.getBalance({ address: target }) < amount / 2n) {
    await publicClient.extend(walletActions).sendTransaction({
      account: await getMasterAccount(publicClient),
      chain: null,
      to: target,
      value: amount
    })
  }
}
