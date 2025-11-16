import {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataParameters,
  GetPaymasterStubDataReturnType,
  PaymasterActions
} from 'viem/account-abstraction'
import { Address } from 'viem'

export class SourceChainPaymaster implements PaymasterActions {
  constructor (readonly address: Address) {
  }

  async getPaymasterData (parameters: GetPaymasterDataParameters): Promise<GetPaymasterDataReturnType> {

    return this.getPaymasterStubData(parameters)
  }

  async getPaymasterStubData (parameters: GetPaymasterStubDataParameters): Promise<GetPaymasterStubDataReturnType> {

    return {
      paymaster: this.address,
      paymasterVerificationGasLimit: 50000n,
      paymasterPostOpGasLimit: 0n,
      paymasterData: '0x'
    }
  }

}
