import { encodeAbiParameters, LocalAccount, parseAbiParameters, TypedDataParameter } from 'viem'
import { UserOperation } from '../types/index.js'
import { getUserOpHash } from '../sdkUtils/index.js'

const DOMAIN_NAME: string = 'CrossChainAccount'
const DOMAIN_VERSION: string = '1'

export async function oneSignatureSignUserOps (
  owner: LocalAccount,
  userOps: UserOperation[]): Promise<UserOperation[]> {

  const userOpHashes = userOps.map(op => getUserOpHash(op))

  const sig = await owner.signTypedData({
    domain: getCrossChainTypedDataDomain(),
    types: getCrossChainTypedDataTypes(),
    primaryType: 'CrossChainAccount',
    message: { userOpHashes }
  })

  let signedUserOps = userOps.map((op, index) => {
    return {
      ...op,
      signature: encodeAbiParameters(
        parseAbiParameters('uint256, bytes, bytes32[]'),
        [BigInt(index), sig, userOpHashes])
    }
  })
  return signedUserOps
}

export function getCrossChainTypedDataDomain (): any {
  return {
    name: DOMAIN_NAME,
    version: DOMAIN_VERSION
  }
}

export function getCrossChainTypedDataTypes (): Record<string, Array<TypedDataParameter>> {
  return {
    CrossChainAccount: [
      { name: 'userOpHashes', type: 'bytes32[]' }
    ]
  }
}
