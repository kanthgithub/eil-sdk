//base for all actions.
// an action is an abstract representation of a single operation executed on-chain.
// it should be able to encode itself into a sequence of Call objects on-chain
import { Call } from "viem";
import { BatchBuilder } from "../builder/BatchBuilder.js";

import { FunctionCall } from "../types/index.js";

/**
 * Base interface for all actions.
 * An action represents a single operation that can be executed on-chain.
 * Each action must be able to encode itself into a sequence of Call objects.
 */
export interface BaseAction {

  /**
   * Encodes an action as an array of {@link Call} objects.
   * @param batch The batch this operation is part of, including the chainId for the current chain.
   * @returns - a Promise resolving to an array of Call objects.
   * @throws - If the action cannot be encoded as a call.
   */
  encodeCall (batch: BatchBuilder): Promise<Array<Call|FunctionCall>>;
}
