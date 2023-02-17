/**
 * If the given graph has a `scope` property, return that. Otherwise, return the
 * graph itself.
 *
 * @param {{scope:Explorable} | Explorable} graph
 * @returns {Explorable}
 */
export function getScope(graph) {
  return graph && "scope" in graph ? graph.scope : graph;
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
