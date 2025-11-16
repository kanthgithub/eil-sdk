import { MultichainToken } from './MultichainToken.js'
import { FunctionCall } from './FunctionCall.js'
import { RuntimeVar } from '../actions/index.js'
import { Address } from 'viem'

/**
 * A multichain asset configuration for {@link SdkVoucherRequest}.
 * @property token              - Token to be used in the transaction, or "ETH_NATIVE" for native ETH
 * @property amount             - Token amount to transfer from the source chain.
 *                                Can be a fixed value or a dynamic value via the {@link FunctionCall}.
 * @property minProviderDeposit - Minimum required provider deposit.
 *                                Defaults to {@link amount} if not dynamic.
 */
export type MultiChainAsset = {
  token: MultichainToken | Address
  amount: bigint | RuntimeVar
  minProviderDeposit?: bigint
};
