import FilterGraph from "../common/FilterGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { parentScope } from "../framework/scopeUtilities.js";

/**
 * Apply a filter to a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} graphVariant
 * @param {GraphVariant} filterVariant
 */
export default async function filter(graphVariant, filterVariant) {
  const filtered = new (InheritScopeTransform(FilterGraph))(
    graphVariant,
    filterVariant
  );
  /** @type {any} */ (filtered).parent = parentScope(this);
  return filtered;
}

filter.usage = `filter <graph>, <filter>\tOnly return values whose keys match the filter`;
filter.documentation = "https://explorablegraph.org/cli/builtins.html#filter";
