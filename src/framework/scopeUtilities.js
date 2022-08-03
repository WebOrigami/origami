import Scope from "../common/Scope.js";

/**
 * Return a new graph whose topmost ancestor will be the given ancestor.
 */
export function addAncestor(graph, ancestor) {
  if (!("parent" in graph)) {
    // Can't extend, leave as is.
    return graph;
  } else {
    const newGraph = Object.create(graph);
    const scopeGraphs = graph.scope?.graphs;
    if (scopeGraphs[0] === graph) {
      // Remove graph from scope, as it will add itself back in when we set the
      // parent.
      scopeGraphs.shift();
    }
    const newScope = new Scope(...scopeGraphs, ancestor);
    newGraph.parent = newScope;
    return newGraph;
  }
}

/**
 * If the given graph has a `scope` property, return that. Otherwise, return the
 * graph itself.
 *
 * @param {{scope:Explorable} | Explorable} graph
 * @returns {Explorable}
 */
export function getScope(graph) {
  return graph !== undefined && "scope" in graph ? graph.scope : graph;
}

/**
 *
 * @param {{parent: Explorable} | {scope:Explorable} | Explorable} graph
 * @returns {Explorable|null}
 */
export function parentScope(graph) {
  return !graph
    ? null
    : "parent" in graph
    ? graph.parent
    : "scope" in graph
    ? graph.scope
    : graph;
}
