import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function parent(treelike) {
  assertIsTreelike(treelike, "parent");
  const tree = Tree.from(treelike);
  return tree.parent;
}
