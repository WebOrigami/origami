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
