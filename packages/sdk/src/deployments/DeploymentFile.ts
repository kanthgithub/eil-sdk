//helper for reading deployment file.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

import { Deployment } from "./Deployment.js";

export function readDeploymentFile (fileName: string): Deployment[] {
  if (!existsSync(fileName)) {
    throw new Error(`Deployment file not found: ${fileName}`);
  }
  return JSON.parse(readFileSync(fileName, 'utf8')) as Deployment[];
}

export function writeDeploymentFile (fileName: string, deployments: Deployment[]): void {
  const dir = fileName.substring(0, fileName.lastIndexOf('/'))
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(fileName, JSON.stringify(deployments, null, 2));
  console.log(`Deployment file written: ${fileName}`);
}

export function getDeployment (fileName: string, chainId: number): Deployment {
  const deployments: Deployment[] = readDeploymentFile(fileName);
  const deployment: Deployment | undefined = deployments.find((d: Deployment) => d.chainId === chainId);
  if (!deployment) {
    throw new Error(`Deployment not found for chain ${chainId} in file ${fileName}`);
  }
  return deployment;
}
