import { Tree } from "@weborigami/async-tree";
import executionContext from "../runtime/executionContext.js";

/**
 * Return an OrigamiFileMap object for the current code context.
 */
export default async function projectRoot() {
  const parent = executionContext.getStore().parent;
  return Tree.root(parent);
}
