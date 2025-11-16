// a normal call action, with static address and data.
import { BaseAction } from "./BaseAction.js";
import { Call } from "viem";

import { BatchBuilder } from "../builder/BatchBuilder.js";
import { FunctionCall } from "../types/index.js";

// a low-level call, to a pre-encoded calldata
export class CallAction implements BaseAction {
  constructor (readonly call: Call) {
  }

  async encodeCall (batch: BatchBuilder): Promise<Array<Call|FunctionCall>> {
    return [this.call]
  }
}
