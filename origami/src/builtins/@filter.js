import FilterTree from "../common/FilterTree.js";
import InheritScopeMixin from "../framework/InheritScopeMixin.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Apply a filter to a tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} treelike
 * @param {Treelike} filterVariant
 */
export default async function filter(treelike, filterVariant) {
  assertScopeIsDefined(this);
  const filtered = new (InheritScopeMixin(FilterTree))(treelike, filterVariant);
  return filtered;
}

filter.usage = `@filter <tree>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://graphorigami.org/language/@filter.html";
