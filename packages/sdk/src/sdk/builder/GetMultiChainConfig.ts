import deploymentFile from '../../assets/deployment.json' with { type: 'json' }
import { Deployment } from '../../deployments/Deployment.js'
import { ChainInfo } from '../config/index.js'
import { createPublicClientFromUrl } from '../../utils/index.js'

/**
 * load default deployment configuration
 */
export function getMultiChainConfig (overrides?: ChainInfo[]): ChainInfo[] {
  const deployments: Deployment[] = deploymentFile as Deployment[]

  if (overrides) {
    //todo: merge with defaults?
    return overrides
  }

  return deployments.map(deploymentToChainInfo)
}

export function deploymentToChainInfo (deployment: Deployment): ChainInfo {
  const chainInfo: ChainInfo = {
    chainId: BigInt(deployment.chainId),
    publicClient: createPublicClientFromUrl(deployment.nodeUrl, deployment.chainId),
    bundlerUrl: deployment.bundlerUrl,
    paymasterAddress: deployment.paymaster,
  }
  return chainInfo
}
