import FilterTree from "../common/FilterTree.js";
import { treeWithScope } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {Treelike} filterVariant
 */
export default async function filter(treelike, filterVariant) {
  assertScopeIsDefined(this);
  /** @type {AsyncTree} */
  let result = new FilterTree(treelike, filterVariant);
  if (this) {
    result = treeWithScope(result, this);
  }
  return result;
}

filter.usage = `@filter <tree>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://graphorigami.org/language/@filter.html";
