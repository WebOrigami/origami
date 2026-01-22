import { Tree } from "@weborigami/async-tree";

/**
 * Return an OrigamiFileMap object for the current code context.
 */
export default async function projectRoot(state) {
  return Tree.root(state.parent);
}
projectRoot.needsState = true;
