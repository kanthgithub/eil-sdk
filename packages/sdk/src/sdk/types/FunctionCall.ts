import { Account, Address, Call } from 'viem'
import { IMultiChainEntity } from './IMultiChainEntity.js'

/**
 * @notice Represents a function call to be executed on a smart contract.
 * @dev Used to define call parameters for contract interaction.
 * @param target The contract address or account to execute the function on.
 * @param functionName The name of the function to call. This function must exist in the contract's ABI.
 * @param args Array of parameters to pass to the function. Can be static values or runtime variables
 * @param abi Optional ABI definition. If not provided, will use target contract's ABI.
 * @param value Optional amount of native currency to send with the call
 * @throws If the target contract does not have the specified function in its ABI.
 * @throws If target is defined as an {@link Address} and ABI is not provided.
 */
export type FunctionCall = {
  target: IMultiChainEntity | Address | Account
  functionName: string
  args?: any[]
  abi?: readonly any[]
  value?: bigint
}

export function getFunctionCallAbi (call: any): any[] {
  const abi = call.abi ?? call.target?.abi
  if (!abi) {
    throw new Error(`no ABI found for ${call}`)
  }
  return abi
}

export function getFunctionCallAddress (call: FunctionCall, chainId: bigint): Address {
  if (typeof call.target == 'string') {
    return call.target as Address
  }
  if ('addressOn' in call.target) {
    return call.target.addressOn(chainId)
  } else if ('address' in call.target) {
    return call.target.address
  } else {
    throw new Error(`FunctionCall target is not a valid address: ${call.target}`)
  }
}

/**
 * @notice Determines if a parameter is a low-level encoded {@link Call} object or a {@link FunctionCall}.
 * @param call The call object to check.
 * @return True if the parameter is a Call object, false if it's a FunctionCall.
 * @typeGuard This is a type guard function that asserts the parameter is of the type {@link Call}.
 */
export function isCall (call: FunctionCall | Call): call is Call {
  return 'to' in call && 'data' in call
}

/**
 * @notice Determines if an object is of the type {@link FunctionCall}.
 * @param call The call object to check.
 * @return True if the parameter is a FunctionCall object.
 * @typeGuard This is a type guard function that asserts the parameter is of the type {@link FunctionCall}.
 */
export function isFunctionCall (call: FunctionCall | Call): call is FunctionCall {
  return (call as any).target != null && call.functionName != null
}

/**
 * @notice Determines if a call has dynamic arguments.
 * @param call The call object to check.
 * @return True if at least one argument is dynamic (of type FunctionCall).
 * @typeGuard This is a type guard function that asserts the parameter is of type {@link FunctionCall}.
 */
export function hasDynamicArguments (call: FunctionCall | Call): call is FunctionCall {
  if (!isFunctionCall(call)) {
    return false
  }
  return call.args?.some((arg: any) => isFunctionCall(arg)) ?? false
}
