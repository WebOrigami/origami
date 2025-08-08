import { Tree } from "@weborigami/async-tree";

// Return the extension handlers for the given tree
export default function getHandlers(tree) {
  if (!tree) {
    return null;
  }
  const root = Tree.root(tree);
  return /** @type {any} */ (root).handlers;
}
