import { Address, Client, getAddress } from 'viem'

export type Addressable = string | Client | { address: any }

//get an address of "Addressable" object, and apply address capitalization.
// input can be a string, or a Client, or a Contract
export function addressOf (s: Addressable): Address {
  // return parseAccount(s).address
  const tmp: any = s as any
  let address: any = tmp.account?.address ?? tmp.address ?? tmp
  if (typeof address !== 'string' || !address.startsWith('0x')) {
    throw new Error(`Object without an address ${s}`)
  }
  return getAddress(address)
}
