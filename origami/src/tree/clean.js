import { Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function clean(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:clean");
  if (!Tree.isAsyncMutableTree(tree)) {
    throw new TypeError("clean: the given tree is read-only.");
  }
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) => tree.set(key, undefined));
  await Promise.all(promises);
  return tree;
}

helpRegistry.set("tree:clean", "(tree) - Remove all values from the tree");
