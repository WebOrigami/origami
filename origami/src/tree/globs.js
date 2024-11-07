import GlobTree from "../common/GlobTree.js";
import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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

helpRegistry.set(
  "tree:globs",
  "(patterns) - A tree whose keys can include wildcard patterns"
);
