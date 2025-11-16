import { FunctionCall, IBundlerManager, isFunctionCall, UserOperation } from '../types/index.js'
import { Address, Call, Hex } from 'viem'
import { SmartAccount } from 'viem/account-abstraction'

import { IMultiChainSmartAccount } from './IMultiChainSmartAccount.js'
import { asCall } from '../sdkUtils/asCall.js'

/**
 * @title BaseMultichainSmartAccount
 * @notice Base class for managing cross-chain smart account instances.
 * @dev This abstract class implements cross-chain account functionality,
 * by hosting multiple {@link SmartAccount} instances on multiple chains.
 * Subclasses must implement:
 * - signUserOps(): Signs UserOps array for multichain execution.
 *                  For example, a basic implementation iterates accounts per-chain and requests individual signatures.
 *                  This is not ideal for UX as the user needs to confirm each signature separately.
 * - encodeCalls(): Encodes function calls array into a single UserOp execution.
 *                  This function supports dynamic {@link FunctionCall} parameters.
 */
export abstract class BaseMultichainSmartAccount implements IMultiChainSmartAccount {

  protected constructor (readonly bundlerManager: IBundlerManager) {}

  abstract hasAddress (chainId: bigint): boolean

  addressOn (chainId: bigint): Address {
    return this.contractOn(chainId).address
  }

  abstract contractOn (chainId: bigint): SmartAccount

  /**
   * @notice Fill the signature of the given UserOperations.
   * @param userOps Array of user operations with chain IDs to sign.
   * @return Array of signed user operations.
   */
  abstract signUserOps (userOps: UserOperation[]): Promise<UserOperation[]>

  /**
   * Encode the set of calls for execution.
   * For static calls with no dynamic runtime variables, can use {@link encodeStaticCalls} instead.
   * @param chainId the chain this array of calls is intended for.
   * @param calls an array of Call or FunctionCalls
   */
  abstract encodeCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex>

  /**
   * Encode a batch of calls that are known to be non-dynamic for execution.
   * @dev The given array of {@link FunctionCall} objects must be all deterministic with no dynamic runtime variables.
   * @param chainId The chain ID of a chain this array of calls is intended for.
   * @param calls An array of static function calls to encode.
   * @return An encoded batch of calls as a hex string.
   * @throws {Error} If any of the calls are dynamic.
   */
  encodeStaticCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex> {
    const hasDynamic = calls.some((call) => isFunctionCall(call))
    if (hasDynamic) {
      throw new Error('encodeStaticCalls: all calls must be static')
    }
    const account = this.contractOn(chainId)
    return account.encodeCalls(
      calls.map(call => asCall(chainId, call))
    )
  }

  async sendUserOperation (userOp: UserOperation): Promise<Hex> {
    return this.bundlerManager.sendUserOperation(userOp)
  }

  async verifyBundlerConfig (chainId: bigint, entryPoints: Address): Promise<void> {
    await this.bundlerManager.verifyConfig(chainId, entryPoints)
  }
}

