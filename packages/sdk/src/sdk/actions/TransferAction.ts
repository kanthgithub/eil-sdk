//basic token "transfer" action.
// this is a helper on top of FunctionCallAction, with ERC20 ABI.
// uses the "MultiChainToken", so the action's chainId is used to get the address.
import { Address, Call } from 'viem'
import {
  BaseAction,
  BatchBuilder,
  FunctionCall,
  MultichainToken,
  RuntimeVar,
} from '../index.js'

export class TransferAction implements BaseAction {
  constructor (readonly data: {
    token: MultichainToken
    recipient: Address
    amount: bigint | RuntimeVar
  }) {
  }

  async encodeCall (batch: BatchBuilder): Promise<Array<Call | FunctionCall>> {
    const tokenAddress = this.data.token.addressOn(batch.chainId)
    if (!tokenAddress) {
      throw new Error(`Token address not found on chain ${batch.chainId} for Approve`)
    }
    return [{
      target: tokenAddress,
      abi: this.data.token.abi,
      functionName: 'transfer',
      args: [this.data.recipient, this.data.amount]
    }]
  }
}
