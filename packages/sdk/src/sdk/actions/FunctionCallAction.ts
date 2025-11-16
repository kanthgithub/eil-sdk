import { Call } from "viem";

import { BaseAction } from "./BaseAction.js";
import { FunctionCall } from "../types/index.js";
import { BatchBuilder } from "../builder/index.js";

//a Function Call, using functionName from contact's ABI
export class FunctionCallAction implements BaseAction {
  constructor (readonly call: FunctionCall) {
  }

  async encodeCall (batch: BatchBuilder): Promise<Array<Call|FunctionCall>> {
    return [this.call];
  }
}
