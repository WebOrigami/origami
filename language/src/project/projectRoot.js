import { Tree } from "@weborigami/async-tree";
import executionContext from "../runtime/executionContext.js";

/**
 * Return an OrigamiFileMap object for the current code context.
 */
export default async function projectRoot() {
  const { state } = executionContext.getStore();
  return Tree.root(state.parent);
}
