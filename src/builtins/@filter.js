import FilterGraph from "../common/FilterGraph.js";
import { getScope } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Apply a filter to a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} graphVariant
 * @param {GraphVariant} filterVariant
 */
export default async function filter(graphVariant, filterVariant) {
  assertScopeIsDefined(this);
  const filtered = new (InheritScopeTransform(FilterGraph))(
    graphVariant,
    filterVariant
  );
  const parent = /** @type {any} */ (this).parent;
  filtered.parent = getScope(parent);
  return filtered;
}

filter.usage = `@filter <graph>, <filter>\tOnly returns values whose keys match the filter`;
filter.documentation = "https://graphorigami.org/language/@filter.html";
