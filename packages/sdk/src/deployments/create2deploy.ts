import {
  Address, Chain, Client,
  encodeDeployData, getContract, GetContractReturnType, getCreate2Address,
  Hex, keccak256, padHex, publicActions, Transport, WalletClient,
} from 'viem'

import { CreateXMetadata } from '../abitypes/abiTypes.js'

type ICreateX = GetContractReturnType<typeof CreateXMetadata.abi, Client>
export const createXaddress: Address = '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed';

//default salt for create2deploy: same code regardless of sender or blockchain
// (too bad "zero" salt means something different: it DOES depend on sender)
export const saltForBytecodeOnly = padHex('0x1', {size: 32})

//make sure CreateX is deployed on the chain
// (needed only on local test environment, where CreateX is not pre-deployed on the forked chain)
export async function deployCreateX (client: WalletClient<Transport, Chain>) {
  const existingCode = await client.request({ method: 'eth_getCode' as any, params: [createXaddress, 'latest'] }) as string
  if (existingCode === '0x') {
    // console.log(`Using "hardhat_setCode" to inject CreateX on chain ${client.chain.id}`)
    await client.request({ method: 'hardhat_setCode' as any, params: [createXaddress, CreateXMetadata.deployedBytecode] })
  }
}

async function getCreateX<C extends Client> (client: C): Promise<ICreateX> {

  await deployCreateX(client as any)
  return getContract({
    abi: CreateXMetadata.abi,
    address: createXaddress,
    client,
  })
}

//calculate the same address create2deploy() would use.
// too bad CreateX made it so complex..
export function getCreate2DeployAddress (
  metadata: any,
  ctrParams: any[] = [],
  salt: Hex = saltForBytecodeOnly): Address {

  const bytecode: Hex = encodeDeployData({
    abi: metadata.abi,
    bytecode: metadata.bytecode as Hex,
    args: ctrParams,
  })

  const guardedSalt = keccak256(salt)

  return getCreate2Address({
    from: createXaddress,
    salt: guardedSalt,
    bytecode
  })
}

/**
 * deploy contract deterministically, using CreateX's create2.
 * note: works only in test mode. specifically, the given "publicClient" supports sendTransaction
 * @param client
 * @param metadata
 * @param ctrParams
 * @param salt
 */
export async function create2deploy (
  client: WalletClient<Transport, Chain>,
  metadata: any,
  ctrParams: any[] = [],
  salt: Hex = saltForBytecodeOnly): Promise<Address> {

  const chainId = await client.getChainId()

  try {

    const bytecode: Hex = encodeDeployData({
      abi: metadata.abi,
      bytecode: metadata.bytecode as Hex,
      args: ctrParams,
    })

    //assume "CreateX" is pre-deployed on the chain.
    const createX = await getCreateX(client)

    const addr = getCreate2DeployAddress(metadata, ctrParams, salt)
    let existingCode = await client.extend(publicActions).getCode({ address: addr })
    if (existingCode != null && existingCode !== '0x') {
      return addr
    }
    await deployCreateX(client)
    const addr1: any = await createX.read.deployCreate2([salt, bytecode])
    if (addr != addr1) {
      throw new Error(`Internal error: computed address ${addr} but CreateX returned ${addr1}`)
    }
    await createX.write.deployCreate2([salt, bytecode])
    console.log(`Deployed ${metadata.contractName} @ ${addr} on chain ${chainId}`)
    return addr
  } catch (error) {
    throw new Error(`Failed to deploy ${metadata.contractName} on chain ${chainId}`, { cause: error })
  }
}
