import { SmartAccount, toSimple7702SmartAccount } from 'viem/account-abstraction'
import {
  Address,
  AuthorizationRequest,
  Call,
  Capabilities,
  Chain,
  createPublicClient,
  custom,
  encodeFunctionData,
  Hash,
  Hex,
  SerializeTransactionFn,
  SignableMessage,
  toHex,
  TransactionSerializable,
  TypedData,
  TypedDataDefinition
} from 'viem'
import {
  BaseMultichainSmartAccount,
  FunctionCall,
  IBundlerManager,
  IJsonRpcProvider,
  isFunctionCall,
  stringifyBigIntReplacer,
  UserOperation
} from '@eil-protocol/sdk'
import { SignAuthorizationReturnType } from 'viem/accounts'
import { toComposableCall } from './encodeComposable.js'
import AmbireAccount from './AmbireAccount.json' with { type: 'json' }

export class AmbireMultiChainSmartAccount extends BaseMultichainSmartAccount {

  accounts: Map<bigint, SmartAccount> = new Map()

  constructor (
    readonly walletProvider: IJsonRpcProvider,
    readonly account: Address,
    readonly chainIds: bigint[],
    bundlerManager: IBundlerManager,
  ) {
    super(bundlerManager)
  }

  async init () {
    const isCapable = await this.checkWalletCapabilities()
    if (!isCapable) {
      throw new Error('AmbireMultiChainSmartAccount: init: wallet does not support all required capabilities.')
    }
    for (const chainId of this.chainIds) {
      const account = await this.createSmartAccountForChain(chainId, this.account)
      this.accounts.set(BigInt(chainId), account)
    }
  }

  async checkWalletCapabilities (): Promise<boolean> {
    let chainIds = this.chainIds.map(chainId => toHex(chainId))
    const capabilities: Capabilities = await this.walletProvider.request({
      method: 'wallet_getCapabilities',
      params: [this.account, chainIds]
    })
    for (const chainId of this.chainIds) {
      const chainCapabilities = capabilities[toHex(chainId)]
      if (chainCapabilities) {
        if (!(
          chainCapabilities['eilCrossChainSigning'] &&
          chainCapabilities['sendRawUserOperation'])
        ) {
          return false
        }
      }
    }
    return true
  }

  async signUserOps (userOps: UserOperation[]): Promise<UserOperation[]> {
    const ambireFormat = userOps.map(op => {
      op.factory = undefined
      op.factoryData = undefined
      return {
        chainId: op.chainId,
        userOperation: op
      }
    })
    const jsonUserOps = JSON.parse(JSON.stringify(ambireFormat, stringifyBigIntReplacer))
    const rawRequest = {
      method: 'wallet_signUserOperations',
      params: jsonUserOps
    }
    console.warn('rawRequest:')
    console.warn(rawRequest)
    const responsesStr: string = await this.walletProvider.request(rawRequest)
    const responses: { chainId: number, userOp: UserOperation }[] = JSON.parse(responsesStr)
    console.warn('responses:')
    console.warn(responses)
    if (responses.length !== userOps.length) {
      throw new Error('AmbireMultiChainSmartAccount: signUserOps: number of responses does not match number of userOps')
    }
    for (let i = 0; i < userOps.length; i++) {
      userOps[i] = responses[i].userOp
    }
    return userOps
  }

  async encodeCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex> {
    const hasDynamic = calls.some((call) => isFunctionCall(call))
    if (hasDynamic) {
      return this.encodeDynamicCalls(chainId, calls)
    } else {
      return this.encodeStaticCalls(chainId, calls)
    }
  }

  private async createSmartAccountForChain (chainId: bigint, address: Address): Promise<SmartAccount> {
    const self = this

    // Create a client for this specific chain
    const client = createPublicClient({
      chain: { id: Number(chainId) } as Chain,
      transport: custom(this.walletProvider)
    })

    return toSimple7702SmartAccount({
      client,
      owner: {
        address,
        sign: function (parameters: { hash: Hash }): Promise<Hex> {
          throw new Error('Function not implemented.')
        },
        signAuthorization: function (parameters: AuthorizationRequest): Promise<SignAuthorizationReturnType> {
          throw new Error('Function not implemented.')
        },
        signMessage: function ({ message }: { message: SignableMessage }): Promise<Hex> {
          throw new Error('Function not implemented.')
        },
        signTransaction: function <serializer extends SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>, transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]> (transaction: transaction, options?: {
          serializer?: serializer | undefined
        } | undefined): Promise<Hex> {
          throw new Error('Function not implemented.')
        },
        signTypedData: function <const typedData extends TypedData | Record<string, unknown>, primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData> (parameters: TypedDataDefinition<typedData, primaryType>): Promise<Hex> {
          throw new Error('Function not implemented.')
        },
        publicKey: '0x',
        source: 'privateKey',
        type: 'local'
      }
    })
  }

  async encodeDynamicCalls (chainId: bigint, calls: Array<Call | FunctionCall>): Promise<Hex> {
    const composableCalls = calls.map(call => toComposableCall(chainId, call))
    const encodedFunctionData: Hex = encodeFunctionData({
      abi: AmbireAccount.abi,
      functionName: 'executeComposableBySender',
      args: [composableCalls],
    })
    return encodedFunctionData
  }

  encodeStaticCalls (_: bigint, calls: Array<Call | FunctionCall>): Promise<Hex> {
    const txs = calls.map((call) => ({
      to: (call as Call).to,
      value: (call as Call).value ?? 0n,
      data: (call as Call).data ?? '0x'
    }))
    const functionData = encodeFunctionData({
      abi: AmbireAccount.abi,
      functionName: 'executeBySender',
      args: [txs]
    })
    return Promise.resolve(functionData)
  }

  hasAddress (chainId: bigint): boolean {
    return this.accounts.has(chainId)
  }

  contractOn (chainId: bigint): SmartAccount {
    if (!this.accounts.has(chainId)) {
      throw new Error(`No account found for chainId: ${chainId}`)
    }
    return this.accounts.get(chainId)!
  }
}

