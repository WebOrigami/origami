import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";
import paginateFn from "./paginateFn.js";

/**
 * Return a new grouping of the treelike's values into chunks of the specified
 * size.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {number} [size=10]
 */
export default async function paginate(treelike, size = 10) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:count");
  return paginateFn.call(this, size)(tree);
}

helpRegistry.set(
  "tree:paginate",
  "(tree, [n]) - Group the tree's values into fixed-size sets"
);
