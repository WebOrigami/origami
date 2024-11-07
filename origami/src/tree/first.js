import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function first(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:first");
  for (const key of await tree.keys()) {
    // Just return first value immediately.
    const value = await tree.get(key);
    return value;
  }
  return undefined;
}

helpRegistry.set("tree:first", "(tree) - The first value in the tree");
