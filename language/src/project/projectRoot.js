import { Tree } from "@weborigami/async-tree";

/**
 * Return an OrigamiFileMap object for the current code context.
 */
export default async function projectRoot(context) {
  return Tree.root(context.container);
}
projectRoot.needsState = true;
