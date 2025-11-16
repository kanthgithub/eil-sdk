import { Address, Call, encodeAbiParameters, encodeFunctionData, Hex, size, sliceHex, toFunctionSelector } from 'viem'

import { ComposableExecution, InputParam, InputParamFetcherType } from '../bcnmy/composability.js'

import {
  assert,
  FunctionCall,
  getFunctionCallAbi,
  getFunctionCallAddress,
  hasDynamicArguments,
  IMultiChainEntity,
  isCall,
  isFunctionCall,
  MultichainContract,
  MultichainToken,
  toAddress
} from '@eil-protocol/sdk'

/**
 * convert a FunctionCall object as a Componsable call
 */
export function toComposableCall (chainId: bigint, call: Call | FunctionCall): ComposableExecution {

  if (!hasDynamicArguments(call)) {
    return callAsComposable(chainId, call)
  }
  let sig: Hex
  let inputParams: InputParam[] = []

  let callArgs = call.args ?? []
  if (call.functionName.startsWith('0x')) {
    //its already a methodsig. don't validate parameters.
    sig = call.functionName as Hex
    inputParams = callArgs.map((param, index) =>
      argToInputParam(param, chainId, { type: 'bytes' }))
  } else {
    const abi: any[] = getFunctionCallAbi(call)
    const abiItem = abi.find((item: any) =>
      item.name === call.functionName &&
      item.type === 'function' &&
      item.inputs.length === callArgs.length) as any
    assert(abiItem, `toComposableCall: no matching function ${call.functionName} with ${call.args?.length} params in ${abi}`)
    sig = toFunctionSelector(abiItem)
    inputParams = callArgs.map((param, index) =>
      argToInputParam(param, chainId, abiItem.inputs[index]))
  }
  return {
    to: getFunctionCallAddress(call, chainId),
    value: call.value ?? 0n,
    functionSig: sig,
    inputParams,
    outputParams: []
  }
}

// encode argument as InputParam:
// if there is a call, it is encoded as CALL_STATIC
// otherwise, encode as RAW_BYTES
//todo: validate the return value of the call to be the right type.
export function argToInputParam (arg: any, chainId: bigint, argAbi: any): InputParam {
  if (isFunctionCall(arg)) {
    const call1 = asCall(chainId, arg)
    return {
      fetcherType: InputParamFetcherType.STATIC_CALL,
      paramData: encodeAbiParameters([{ type: 'address' }, { type: 'bytes' }], [call1.to, call1.data ?? '0x']),
      constraints: []
    }
  } else {
    if (MultichainContract.isMultichainContract(arg)) {
      arg = arg.addressOn(chainId)
      assert(argAbi.type === 'address', `argToInputParam: expected address type, got ${argAbi.type}`)
    }
    //parameter is static value. encode as RAW_BYTES
    return {
      fetcherType: InputParamFetcherType.RAW_BYTES,
      paramData: encodeAbiParameters([argAbi], [arg]),
      constraints: []
    }
  }
}

// encode a pre-determined call with no dynamic parameters as composable execution.
//NOTE: composable must have a methodSig, so callData must be at least 4 bytes long
export function callAsComposable (chainId: bigint, call: Call | FunctionCall): ComposableExecution {
  const acall = asCall(chainId, call)
  if (acall.data == null || size(acall.data) < 4) {
    throw new Error(`Cannot make a call without a methodSig: ${call}`)
  }
  const functionSig = sliceHex(acall.data!, 0, 4)
  //bug in viem.sliceHex: revert if offset is end of string, instead of returning '0x'
  const params = size(acall.data!) > 4 ? sliceHex(acall.data!, 4) : '0x'
  return {
    to: acall.to,
    value: acall.value ?? 0n,
    functionSig,
    inputParams: [{
      fetcherType: InputParamFetcherType.RAW_BYTES,
      paramData: params,
      constraints: []
    }],
    outputParams: []
  }
}

// encode as a static call: must not have dynamic parameters
export function asCall (chainId: bigint, call: Call | FunctionCall): Call {
  assert(!hasDynamicArguments(call), `asCall: cannot encode dynamic call: ${call} as static`)
  if (isCall(call)) {
    return {
      to: call.to,
      data: call.data,
      value: call.value ?? 0n,
    }
  } else {
    const call1 = call as FunctionCall
    let callArgs = call1.args ?? []
    return {
      to: toAddress(chainId, call1.target),
      data: encodeFunctionData({
        abi: getFunctionCallAbi(call1),
        functionName: call1.functionName,
        args: callArgs.map(arg => resolveMultiChainAddress(chainId, arg))
      }),
      value: call1.value ?? 0n,
    }
  }
}

//if "arg" is multichain contract (has "addressOn"), resolve it to the address on the given chainId.
// otherwise, return the argument as is.
function resolveMultiChainAddress (chainId: bigint, arg: any): any {
  if (typeof arg === 'object') {
    if ('addressOn' in arg) {
      return arg.addressOn(chainId)
    }
    if ('address' in arg) {
      return arg.address
    }
  }
  return arg
}

export function runtimeBalanceOf (token: MultichainToken, addr: IMultiChainEntity | Address): FunctionCall {
  return {
    target: token,
    functionName: 'balanceOf',
    args: [addr],
  }
}
