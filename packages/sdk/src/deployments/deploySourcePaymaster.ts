import { Address, Chain, Transport, WalletClient } from 'viem'

import { SimplePaymasterMeta } from '../abitypes/abiTypes.js'
import { entryPoint09Address } from '../sdk/index.js'

import { create2deploy, getCreate2DeployAddress } from './create2deploy.js'

// paymaster owner is an address without a private-key. requires virtual-net admin to impersonate.
const sourcePaymasterOwner = '0x'.padEnd(42, 'face')

export function getSimplePaymasterAddress () {
  return getCreate2DeployAddress(SimplePaymasterMeta, [entryPoint09Address, sourcePaymasterOwner])
}

export async function deploySimplePaymaster (walletClient: WalletClient<Transport, Chain>): Promise<Address> {
  return await create2deploy(walletClient, SimplePaymasterMeta, [entryPoint09Address, sourcePaymasterOwner])
}
