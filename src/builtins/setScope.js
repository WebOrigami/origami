import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { graphInContext, keySymbol } from "../core/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a copy of the given graph that has the indicated graphs as its scope.
 *
 * @param {GraphVariant} variant
 * @param  {...GraphVariant} scopeGraphs
 * @this {Explorable}
 */
export default function setScope(variant, ...scopeGraphs) {
  assertScopeIsDefined(this);
  const graph = ExplorableGraph.from(variant);
  const scope = scopeGraphs.length === 0 ? this : new Scope(...scopeGraphs);
  const result = graphInContext(graph, scope);
  result[keySymbol] = graph[keySymbol];
  return result;
}

setScope.usage = `setScope <graph>, <...graphs>\tReturns a graph copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#setScope";
