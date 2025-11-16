import { Address, Chain, Transport, WalletClient } from 'viem'

import { XlpSelectionHelper } from '../abitypes/abiTypes.js'

import { create2deploy } from './create2deploy.js'

export async function deployXlpSelectionHelper (walletClient: WalletClient<Transport, Chain>): Promise<Address> {
  return await create2deploy(walletClient, XlpSelectionHelper)
}
