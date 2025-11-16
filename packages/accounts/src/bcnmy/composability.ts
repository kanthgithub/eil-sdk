// Parameter type for composition
import { Address, Hex } from "viem";

export enum InputParamFetcherType {
  RAW_BYTES, // Already encoded bytes
  STATIC_CALL // Perform a static call
}

export enum OutputParamFetcherType {
  EXEC_RESULT, // The return of the execution call
  STATIC_CALL // Call to some other function
}

// Constraint type for parameter validation
export enum ConstraintType {
  EQ, // Equal to
  GTE, // Greater than or equal to
  LTE, // Less than or equal to
  IN // In range
}

// Constraint for parameter validation
export type Constraint = {
  constraintType: ConstraintType;
  referenceData: Hex;
}

// Structure to define parameter composition
export type InputParam = {
  fetcherType: InputParamFetcherType; // How to fetch the parameter
  paramData: Hex;
  constraints: Constraint[];
}

// Structure to define return value handling
export type OutputParam = {
  fetcherType: OutputParamFetcherType; // How to fetch the parameter
  paramData: Hex
}

// Structure to define a composable execution
export type ComposableExecution = {
  to: Address;
  value: bigint;
  functionSig: Hex;
  inputParams: InputParam[];
  outputParams: OutputParam[];
}


export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>
} : T;


function expandConstraint (constraint: DeepPartial<Constraint> = {}): Constraint {
  return {
    constraintType: constraint.constraintType ?? ConstraintType.EQ,
    referenceData: constraint.referenceData ?? "0x"
  }
}

function expandInputParam (input: DeepPartial<InputParam> = {}): InputParam {
  return {
    fetcherType: input.fetcherType ?? InputParamFetcherType.RAW_BYTES,
    paramData: input.paramData ?? "0x",
    constraints: input.constraints?.map(expandConstraint) ?? []
  }
}

function expandOutputParam (output: DeepPartial<OutputParam> = {}): OutputParam {
  return {
    fetcherType: output.fetcherType ?? OutputParamFetcherType.EXEC_RESULT,
    paramData: output.paramData ?? "0x"
  }
}

export function expandComposable (
  execution: DeepPartial<ComposableExecution> = {}
): ComposableExecution {
  return {
    to: execution.to ?? "0x",
    value: execution.value ?? 0n,
    functionSig: execution.functionSig ?? "0x",
    inputParams: execution.inputParams?.map(expandInputParam) ?? [],
    outputParams: execution.outputParams?.map(expandOutputParam) ?? []
  }
}

export function expandExecution (
  execution: DeepPartial<ComposableExecution>[],
): ComposableExecution[] {
  return execution.map(expandComposable)
}
