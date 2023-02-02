import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Return a copy of the given graph that has the indicated graphs as its scope.
 *
 * @param {GraphVariant} variant
 * @param  {...GraphVariant} scopeGraphs
 * @this {Explorable}
 */
export default async function setScope(variant, ...scopeGraphs) {
  const graph = ExplorableGraph.from(variant);

  let result;
  if ("parent" in graph) {
    // Extend prototype chain to avoid destructively modifying the original.
    result = Object.create(graph);
  } else {
    // Setting scope implies the use of InheritScopeTransform.
    result = transformObject(InheritScopeTransform, graph);
  }

  const scope = scopeGraphs.length === 0 ? this : new Scope(...scopeGraphs);
  result.parent = scope;
  return result;
}

setScope.usage = `setScope <graph>, <...graphs>\tReturns a graph copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#setScope";
