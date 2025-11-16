import { readdirSync, readFileSync } from "node:fs";

import { EntryPointMeta } from "../abitypes/abiTypes.js";

import { initDecodeErrorAbis } from "./decodeError.js";

export function initDecodeErrorFromArtifacts (): void {
  //read all ABIs from the "artifacts" folder:
  const artifactsDir: string = __dirname + '/@eil-protocol/contracts/artifacts'
  const artifacts: any[] = [
    EntryPointMeta
  ]
  for (const file of readdirSync(artifactsDir, { recursive: true })) {
    if (typeof file == 'string' && file.endsWith('.json')) {
      const artifact: any = JSON.parse(readFileSync(`${artifactsDir}/${file}`, 'utf-8'));
      artifacts.push(artifact);
    }
  }
  initDecodeErrorAbis(artifacts)
}
