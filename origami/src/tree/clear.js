import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function clear(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:clear");
  if (!Tree.isAsyncMutableTree(tree)) {
    throw new TypeError("clean: the given tree is read-only.");
  }
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) => tree.set(key, undefined));
  await Promise.all(promises);
  return tree;
}
