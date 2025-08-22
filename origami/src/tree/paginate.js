import { paginate } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

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
export default async function paginateBuiltin(treelike, size = 10) {
  const tree = await getTreeArgument(this, arguments, treelike, "paginate");
  const paginated = await paginate(tree, size);
  paginated.parent = this;
  return paginated;
}
