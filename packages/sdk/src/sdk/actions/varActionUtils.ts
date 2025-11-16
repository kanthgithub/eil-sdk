import { Address, encodeFunctionData, getCreate2Address, Hex, isHex, keccak256, sliceHex, toHex } from 'viem'

import { BatchBuilder } from '../builder/index.js'
import { FunctionCall, getFunctionCallAbi, getFunctionCallAddress } from '../types/index.js'
import { RuntimeVarsHelper } from '../../abitypes/abiTypes.js'
import { createXaddress, saltForBytecodeOnly } from '../../deployments/create2deploy.js'

/**
 * Validates that the given argument is not a runtimeVar or does not accidentally look like a runtimeVar.
 */
function validateUnlikeRuntimeVar (arg: any) {
  if (isHex(arg) || typeof arg === 'bigint') {
    const v = BigInt(arg)
    if ((v & MAGIC_MASK) == MAGIC_MARK) {
      throw new Error(`args already contain encoded runtimeVar`)
    }
  }
}

/**
 * Expand the given {@link FunctionCall} to a use the `resolveVars` function on-chain to resolve all runtime variables.
 * If the given {@link FunctionCall} has no dynamic runtime variables in its arguments, return it as-is.
 * @param call the {@link FunctionCall} to check.
 * @param batch the {@link BatchBuilder} this call is part of.
 *              Used to resolve the target's address and verify the referenced variables are already set in the batch.
 */
export function prepareCallWithRuntimeVars (call: FunctionCall, batch: BatchBuilder): FunctionCall {

  if (!hasRuntimeVar(call.args)) {
    return call
  }

  // replace all runtimeVars with masked encoded values
  const args = processTree(call.args, (arg: any) => {
    return encodeVarNameMarked(arg, batch)
  })

  // the encoded callData, with runtimeVars encoded
  const data = encodeFunctionData({

    abi: getFunctionCallAbi(call),
    functionName: call.functionName,
    args,
  }) // remove method signature

  // replace the "data" with a FunctionCall, which passes the entire params block through Vars.runtimeVars()
  const methodSig: Hex = sliceHex(data, 0, 4)
  const methodCallData: Hex = sliceHex(data, 4)

  const replaceVarCall = {
    target: getRuntimeVarsContractAddress(),
    functionName: 'replaceVars',
    args: [methodCallData],
    abi: RuntimeVarsHelper.abi
  }
  return {
    target: getFunctionCallAddress(call, batch.chainId),
    abi: getFunctionCallAbi(call),
    functionName: methodSig,
    args: [replaceVarCall]
  }
}

//return true if anywhere inside the "arg" tree there is a reference to a runtimeVar.
function hasRuntimeVar (arg: any): boolean {
  try {
    processTree(arg, (a: any) => {
      if (a?.runtimeVar != null) {
        //found a runtimeVar. early abort.
        throw new Error('found runtimeVar')
      }
      return null // continue processing
    })
    return false
  } catch (e: any) {
    if (e.message === 'found runtimeVar') {
      return true
    }
    throw e
  }
}

/**
 * Function that processes each item in a tree.
 * Return value:
 * - non-null: replace the current item with the returned value.
 * - null: continue recursive processing.
 */
type ProcessItemFunc = (arg: any) => any | null

/**
 * Recursively processes all items in a tree structure, allowing transformation of values.
 * @param arg - The input value to process.
 *              Can be of any supported argument of a {@link FunctionCall} type:
 *              an object, an array, a fixed primitive type variable or a runtime dynamic variable.
 * @param processItem - A function that processes each item. See {@link ProcessItemFunc} for details.
 * @returns The processed tree with transformed values
 */
function processTree (arg: any, processItem: ProcessItemFunc): any {
  if (arg != null) {
    const val = processItem(arg)
    if (val != null) {
      return val
    }
  }
  if (Array.isArray(arg)) {
    return arg.map((a: any) => processTree(a, processItem))
  }
  if (typeof arg == 'object' && arg !== null) {
    const newObj: any = {}
    for (const key in arg) {
      newObj[key] = processTree(arg[key], processItem)
    }
    return newObj
  }
  return arg
}

/**
 * Returns the deterministically deployed {@link RuntimeVarsHelper} contract address.
 * @returns {Address} The contract address calculated using CREATE2.
 */
export function getRuntimeVarsContractAddress (): Address {
  const guardedSalt = keccak256(saltForBytecodeOnly)
  return getCreate2Address({
    from: createXaddress,
    salt: guardedSalt,
    bytecode: RuntimeVarsHelper.bytecode as Hex,
  })
}

/**
 * A constant from the {@link RuntimeVarsHelper} contract.
 * Used to mark encoded variable names as a "runtimeVar" in the {@link FunctionCall} arguments.
 * See {@link encodeVarNameMarked} for more details.
 */
const MAGIC_MARK = BigInt('0x00000000000000000000000011223344aabbccdd000000000000000000000000')

/**
 * A constant from the {@link RuntimeVarsHelper} contract.
 * Used to mark encoded variable names as a "runtimeVar" in the {@link FunctionCall} arguments.
 * See {@link encodeVarNameMarked} for more details.
 */
const MAGIC_MASK = BigInt('0xffffffffffffffffffffffffffffffffffffffff000000000000000000000000')

/**
 * Modify the value by applying the {@link MAGIC_MARK} bitmap to the argument.
 * The argument is considered to be an encoded variable name by {@link encodeVarName}.
 * This will allow {@link RuntimeVarsHelper} contract to use `replaceVars()` to find and resolve this variable.
 */
function encodeVarNameMarked (arg: any, batch: BatchBuilder): bigint | null {
  validateUnlikeRuntimeVar(arg)

  if (arg.functionName != null) {
    throw new Error(`args already contain a runtime call with functionName: ${arg.functionName}`)
  }
  if (arg?.runtimeVar == null) {
    return null
  }
  if (!batch.hasVar(arg.runtimeVar)) {
    throw new Error(`runtimeVar("${arg.runtimeVar}") is used, but not set in this batch on chain ${batch.chainId}`)
  }
  return encodeVarName(arg.runtimeVar) | MAGIC_MARK
}

/**
 * Encodes a variable name as a hex value.
 * @param name The variable name to encode. Must not exceed 8 characters.
 * @returns {BigInt} The encoded name as a bigint in hex format.
 * @throws {Error} If the variable name is too long.
 */
export function encodeVarName (name: string): bigint {
  if (name.length > 8) {
    throw new Error(`Variable name "${name}" is too long, must be max 8 characters`)
  }
  return BigInt(toHex(name))
}

