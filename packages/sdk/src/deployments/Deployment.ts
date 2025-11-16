import { Address } from 'viem'

// The deployment file is an array of "Deployment" objects.
// To parse the file, do JSON.parse(fileContent) as Deployment[].
// In the docker environment, can use the "readDeploymentFile" function.
export type Deployment = {
  chainId: number
  nodeUrl: string
  bundlerUrl: string
  l2Bridge?: Address // the L1 <-> L2 bridge on the L2 chain
  l2Connector?: Address // the L2 bridge connector deployed on the L2 chain
  paymaster: Address
  sourcePaymaster: Address
  xlpSelectionHelper: Address
  stakeManager?: Address
  entryPoint: Address
  accountFactory: Address
  l1Connectors?: { [key: string]: Address } // mapping of L2 chainId -> L1 connector address
}
