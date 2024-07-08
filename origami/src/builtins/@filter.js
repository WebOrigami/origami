import FilterTree from "../common/FilterTree.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {Treelike} filterVariant
 */
export default async function filter(treelike, filterVariant) {
  assertTreeIsDefined(this, "filter");
  const result = new FilterTree(treelike, filterVariant);
  return result;
}

filter.usage = `@filter <tree>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://weborigami.org/language/@filter.html";
