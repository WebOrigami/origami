import { merge, Tree } from "@weborigami/async-tree";

// Return the extension handlers for the given tree
export default function getHandlers(tree) {
  if (!tree) {
    return null;
  }
  const root = Tree.root(tree);
  return root.handlers || root.config
    ? merge(root.handlers, root.config)
    : null;
}
