import { Account, Address } from 'viem'

/**
 * An interface for a multi-chain object.
 * May have different address per chain (e.g. tokens, accounts, contracts).
 */
export interface IMultiChainEntity {
  /**
   * Returns true if the object has an address configured for the given chain.
   * This may also return true for a default address that is not specific to a given chain.
   * If this function returned false, calling {@link addressOn} for this chain will throw an error.
   *
   * @param chainId - The target chain.
   */
  hasAddress (chainId: bigint): boolean

  /**
   * Resolves the address of a contract on a specific chain.
   * Throws is the address is not configured for the chain.
   *
   * Use {@link hasAddress} to check if the object has an address for the chain before calling this method.
   *
   * @param chainId - The target chain.
   * @return the target address on the chain.
   */
  addressOn (chainId: bigint): Address;
}

export function isValidAddress (chainId: bigint, addr: Address | IMultiChainEntity | Account): boolean {
  // noinspection SuspiciousTypeOfGuard
  if (typeof addr === 'string' || 'address' in addr) {
    return true
  }
  if ('hasAddress' in addr) {
    return (addr as IMultiChainEntity).hasAddress(chainId)
  }
  return false
}

/**
 * Resolves the address of a contract for a specific chain.
 * Throws if the address cannot be resolved or is not configured for the chain.
 *
 * @param chainId - The target chain.
 * @param addr an address or an object with an address
 * @return the target address on the chain.
 */
export function toAddress (chainId: bigint, addr: Address | IMultiChainEntity | Account): Address {
  // noinspection SuspiciousTypeOfGuard
  if (typeof addr === 'string') {
    return addr as Address
  }
  if ('addressOn' in addr) {
    return (addr as any).addressOn(chainId)
  }
  if ('address' in addr) {
    return addr.address as Address
  }
  throw new Error('Invalid address type provided. Must be Address, MultiChainEntity, or Account.')
}
