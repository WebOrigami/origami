import FilterGraph from "../common/FilterGraph.js";
import { getScope } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Apply a filter to a graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} Graphable
 * @param {Graphable} filterVariant
 */
export default async function filter(Graphable, filterVariant) {
  assertScopeIsDefined(this);
  const filtered = new (InheritScopeTransform(FilterGraph))(
    Graphable,
    filterVariant
  );
  const parent = /** @type {any} */ (this).parent;
  filtered.parent = getScope(parent);
  return filtered;
}

filter.usage = `@filter <graph>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://graphorigami.org/language/@filter.html";
