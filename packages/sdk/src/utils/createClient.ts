import {
  Account,
  Chain,
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  PublicClient,
  Transport,
  WalletClient
} from 'viem'
import { privateKeyToAccount, toAccount } from 'viem/accounts'

import { getMasterAccount } from '../sdk/index.js'

function createChain (transport: Transport, chainId: number): Chain {
  const client: PublicClient = createPublicClient({ transport })

  return {
    id: chainId,
    name: `Chain ${chainId}`,
    nativeCurrency: { name: 'Native', symbol: 'nat', decimals: 18 },
    rpcUrls: { default: { http: [client.transport.url] } }
  }
}

export function createWalletClientFromUrl (rpcUrl: string, chainId: number, account: Account): WalletClient<Transport, Chain> {
  const transport: Transport = http(rpcUrl)

  return createWalletClient({
    account,
    chain: createChain(transport, chainId),
    transport,
  })
}

export function createPublicClientFromUrl (rpcUrl: string, chainId: number, pollingInterval?: number): PublicClient {
  const transport: Transport = http(rpcUrl)

  return createPublicClient({
    chain: createChain(transport, chainId),
    transport,
    pollingInterval
  })
}

export async function getChainIdFromUrl (rpcUrl: string): Promise<number> {
  return createPublicClientFromUrl(rpcUrl, 0).getChainId()
}

export async function createPublicClientWithChainIdFromUrl (rpcUrl: string): Promise<PublicClient> {
  const chainId: number = await getChainIdFromUrl(rpcUrl)
  const publicClient: PublicClient = createPublicClientFromUrl(rpcUrl, chainId)
  return publicClient
}

export async function getClientsForDeployment (url: string): Promise<{
  publicClient: PublicClient
  walletClient: WalletClient<Transport, Chain>
}> {
  const publicClient: PublicClient = await createPublicClientWithChainIdFromUrl(url)
  const chainId: number = await publicClient.getChainId()
  const deployerKey: Hex | undefined = process.env.DEPLOYER_KEY as Hex | undefined
  const walletClient: WalletClient<Transport, Chain> = deployerKey == null
    ? createWalletClientFromUrl(url, chainId, toAccount(await getMasterAccount(publicClient)))
    : createWalletClientFromUrl(url, chainId, privateKeyToAccount(deployerKey))
  return { publicClient, walletClient }
}
