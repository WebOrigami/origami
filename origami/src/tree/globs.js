import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import GlobTree from "./GlobTree.js";

/**
 * Define a tree whose keys are globs.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} tree
 * @this {AsyncTree|null}
 */
export default async function globs(tree) {
  assertTreeIsDefined(this, "tree:globs");
  const result = new GlobTree(tree);
  return result;
}
