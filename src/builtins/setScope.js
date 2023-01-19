import Scope from "../common/Scope.js";
import meta from "./meta.js";

/**
 * Return a copy of the given graph that has the indicated graphs as its scope.
 *
 * @param {GraphVariant} graph
 * @param  {...GraphVariant} scopeGraphs
 * @this {Explorable}
 */
export default async function setScope(graph, ...scopeGraphs) {
  // Setting scope implies the use of MetaTransform.
  let result = await meta.call(this, graph);
  // If the graph is already a metagraph, it will be returned as is.
  if (result === graph) {
    // Extend prototype chain to avoid destructively modifying the original.
    result = Object.create(result);
  }
  const scope = scopeGraphs.length === 0 ? this : new Scope(...scopeGraphs);
  result.parent = scope;
  return result;
}

setScope.usage = `setScope <graph>, <...graphs>\tReturns a graph copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#setScope";
