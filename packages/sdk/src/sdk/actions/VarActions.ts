import {
  Call,
  toHex
} from 'viem'

import {
  FunctionCall,
  hasDynamicArguments,
} from '../types/index.js'
import { FunctionCallAction } from './index.js'
import { BatchBuilder } from '../builder/index.js'
import { RuntimeVarsHelper } from '../../abitypes/abiTypes.js'
import { encodeVarName, getRuntimeVarsContractAddress, prepareCallWithRuntimeVars } from './varActionUtils.js'
import { asCall } from '../sdkUtils/asCall.js'


export type RuntimeVar = {
  runtimeVar: string
}

/**
 * Reference the runtime value of a variable.
 * This value can be used as an argument inside the {@link FunctionCall}.
 * Runtime values can be used either directly as call parameters or nested in a struct field.
 *
 * First, create a {@link SetVarAction} that assigns the variable with the value returned by a static function.
 * Later, use that variable in the same batch via {@link runtimeVar} in {@link addAction} and {@link addVoucherRequest}.
 */
export function runtimeVar (name: string): RuntimeVar {
  return {
    runtimeVar: name
  }
}

export type SetVarFunctionCall = FunctionCall & {
  setVar: string
}

/**
 * Sets a variable to store the result of a function call.
 * Makes a static call to the target and saves the 32-byte result (`uint256`, `bytes32`, etc.) into a named variable.
 * The stored value can be referenced later in the same batch using `runtimeVar(name)` syntax.
 * The variable name must be 8 characters or less, and the function call must not have dynamic arguments.
 */
export class SetVarAction extends FunctionCallAction {

  constructor (readonly call: SetVarFunctionCall) {
    super(call)
    if (call.setVar.length > 8) {
      throw new Error(`SetVarAction: variable name "${call.setVar}" is too long, must be max 8 characters`)
    }
    if (hasDynamicArguments(call)) {
      throw new Error(`SetVarAction(${call.setVar}): call must not be dynamic`)
    }
  }

  async encodeCall (batch: BatchBuilder): Promise<Array<Call | FunctionCall>> {

    batch.addVar(this.call.setVar)

    const encodedName = encodeVarName(this.call.setVar)
    let call: FunctionCall = {
      target: getRuntimeVarsContractAddress(),
      functionName: 'setVarFunction',
      args: [
        toHex(encodedName, { size: 32 }),
        this.call.target, asCall(batch.chainId, prepareCallWithRuntimeVars(this.call, batch)).data],
      abi: RuntimeVarsHelper.abi
    }
    return [call]
  }
}
