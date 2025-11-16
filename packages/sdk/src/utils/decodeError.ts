import { decodeErrorResult, DecodeErrorResultReturnType, Hex } from 'viem'

import { allMetaData } from '../abitypes/abiTypes.js'

//recursively decode bytecode within errors:
// any error with a "bytes" parameter recursively decoded
// useful with FailedOpWithRevert ...
export function recursiveDecodeErrorResult (bytes: Hex): string {
  try {
    return decodeErrorArgs(decodeErrorResult({ abi: getGlobalAbi(), data: bytes }))
  } catch {
    // console.log('=== Error decoding error result ===', e);
    return bytes
  }
}

let globalAbi: any[] = []

function getGlobalAbi (): any[] {
  try {
    if (globalAbi.length === 0) {
      initDecodeErrorAbis(allMetaData)
    }
  } catch (e) {
    console.log('=== Error reading global ABI ===', e)
  }
  return globalAbi
}

//initialize ABIs to be used by decodeErrors.
// in node environment, you may use initDecodeErrorFromArtifacts(dir), to read all files from "artifacts" directory.
export function initDecodeErrorAbis (artifacts: any[]) {

  const uniqueErrors: Map<string, any> = new Map()
  for (const artifact of artifacts) {
    if (!artifact.abi) {
      console.warn(`Artifact ${artifact.name} has no ABI, skipping`)
      continue
    }
    //add all errors from the artifact:
    artifact.abi.forEach((item: any) => {
      if (item.type === 'error') {
        uniqueErrors.set(item.name, item)
      }
    })
    globalAbi = Array.from(uniqueErrors.values())
  }
}

function decodeErrorArgs (decoded: DecodeErrorResultReturnType): string {
  const args: any[] = decoded.args as any ?? []
  args.forEach((arg: any, index: number) => {
    // detect "bytes" to decode: either method-sig alone (4-byte, or 10 chars)
    // or a method with params (at least 4+32 bytes, or 72 chars)
    // thus we avoid checking "address" or "bytes32"
    if (typeof (arg) === 'string' && arg.startsWith('0x')
      // && (arg.length==10 || arg.length >= 72)
    ) {
      // try to decode function decursively
      args[index] = recursiveDecodeErrorResult(arg as Hex)
    }
  })
  return decoded.errorName + '(' +
    args.map(
      (a: any) =>
        typeof a === 'string' ? `"${a}"` :
          typeof a === 'bigint' ? a.toString() :
            a
    ).join(', ') +
    ')'
}

