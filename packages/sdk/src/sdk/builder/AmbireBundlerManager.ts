import { Address, Hex, toHex } from 'viem'

import { stringifyBigIntReplacer } from '../sdkUtils/SdkUtils.js'
import { IBundlerManager, SendRawUserOperationInput, SendRawUserOperationResponse } from '../types/IBundlerManager.js'
import { UserOperation } from '../types/UserOperation.js'
import { IJsonRpcProvider } from '../types/index.js'

export class AmbireBundlerManager implements IBundlerManager {

  constructor (
    readonly walletProvider: IJsonRpcProvider,
    readonly entryPoints: Map<bigint, Address>
  ) {}

  verifyConfig (_: bigint): Promise<void> {
    console.warn('AmbireBundlerManager does not support verifyConfig')
    return Promise.resolve()
  }

  async sendUserOperation (userOp: UserOperation): Promise<Hex> {
    const chainId = userOp.chainId!
    const response = await this.sendRawUserOperation({
      chainId: chainId,
      userOp
    })
    return response
  }

  async sendRawUserOperation (userOps: SendRawUserOperationInput): Promise<Hex> {
    const jsonUserOps = JSON.parse(JSON.stringify(userOps, stringifyBigIntReplacer))
    return this.walletProvider.request({
      method: 'eth_sendRawUserOperation',
      params: [jsonUserOps]
    })
  }
}
