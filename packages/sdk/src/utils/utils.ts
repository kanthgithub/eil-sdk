import { Address } from 'viem'

export function nowSeconds (): number {
  return Math.floor(Date.now() / 1000)
}

export function isSameAddress (a: Address, b: Address): boolean {
  return a.toLowerCase() == b.toLowerCase()
}
