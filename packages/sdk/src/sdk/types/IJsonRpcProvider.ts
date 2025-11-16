import { EIP1193RequestFn } from 'viem'

export interface IJsonRpcProvider {
  request: EIP1193RequestFn
}
