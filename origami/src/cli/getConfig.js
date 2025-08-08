import { Tree } from "@weborigami/async-tree";

// Return the config for the given tree
export default function getConfig(tree) {
  if (!tree) {
    return null;
  }
  /** @type {any} */
  const root = Tree.root(tree);
  return root.config;
}
