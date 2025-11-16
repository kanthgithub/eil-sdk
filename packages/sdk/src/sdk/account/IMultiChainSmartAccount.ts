import { SmartAccount, UserOperation } from 'viem/account-abstraction'
import { Address, Call, Hex } from 'viem'
import { FunctionCall, IMultiChainEntity } from '../types/index.js'


export interface IMultiChainSmartAccount extends IMultiChainEntity {

  /**
   * @notice Returns the smart account instance for the given chainId.
   * @dev The returned {@link SmartAccount} object doesn't have to be a deployed contract.
   * @dev The returned instance may instead create a UserOp that deploys the actual account contract.
   * @param chainId The chain ID to get the account for
   * @throws Error if no account found for chainId
   * @return The smart account instance for the specified chain.
   */
  contractOn (chainId: bigint): SmartAccount

  /**
   * Signs an array of UserOperations for multichain execution
   * @param userOps Array of user operations with chain IDs to sign
   * @returns Promise that resolves when all UserOps are signed
   */
  signUserOps (userOps: UserOperation[]): Promise<UserOperation[]>

  /**
   * Encodes function calls for execution on a specific chain
   * @param chainId The chain ID this array of calls is intended for
   * @param calls An array of Call or FunctionCall objects to encode
   * @returns Promise resolving to encoded calls as hex string
   */
  encodeCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex>

  /**
   * Encodes a batch of static calls for execution
   * @param chainId The chain ID this array of calls is intended for
   * @param calls An array of static function calls to encode
   * @returns A Promise with the encoded batch of calls as a hex string
   * @throws Error if any of the calls are dynamic
   */
  encodeStaticCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex>

  /**
   * Sends a UserOperation to the bundler for execution using the configured {@link IBundlerManager} member.
   * @param userOp The UserOperation to send
   * @returns Promise resolving to the UserOperation hash
   */
  sendUserOperation (userOp: UserOperation): Promise<Hex>

  /**
   * Verifies that the bundler configuration for the given UserOperation is valid.
   * @throws Error if the bundler configuration is invalid
   */
  verifyBundlerConfig (chainId: bigint, entryPoints: Address): Promise<void>
}
