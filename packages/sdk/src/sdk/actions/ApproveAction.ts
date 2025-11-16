//like "transfer": helper for ERC20 "approve" action.
import { BaseAction } from "./BaseAction.js";
import { Address, Call } from "viem";
import { FunctionCall, MultichainToken } from "../types/index.js";
import { BatchBuilder } from "../builder/index.js";
import { RuntimeVar } from './VarActions.js'

export class ApproveAction implements BaseAction {
  constructor (readonly data: {
    token: MultichainToken
    spender: Address
    value: bigint | RuntimeVar
  }) {
  }

  async encodeCall (batch: BatchBuilder): Promise<Array<Call | FunctionCall>> {
    const tokenAddress = this.data.token.addressOn(batch.chainId);
    if (!tokenAddress) {
      throw new Error(`Token address not found on chain ${batch.chainId} for Transfer`);
    }
    return [{
      target: tokenAddress,
      abi: this.data.token.abi,
      functionName: 'approve',
      args: [this.data.spender, this.data.value]
    }];
  }
}
