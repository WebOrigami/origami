import ExplorableGraph from "../core/ExplorableGraph.js";

export default class Scope {
  constructor(...variants) {
    const filtered = variants.filter((variant) => variant != undefined);
    const graphs = filtered.map((variant) => ExplorableGraph.from(variant));

    // If a graph argument has a `graphs` property, use that instead.
    const flattened = graphs.flatMap(
      (graph) => /** @type {any} */ (graph).graphs ?? graph
    );

    // Mark all graphs but the first as being in scope. TODO: the "is in scope"
    // terminology has become confusing and should be reconsidered. The first
    // graph is also "in scope", but has isInScope set to false. The marker
    // really means: Should this graph's non-inherited formulas be applied?
    const scopes = flattened.map((graph, index) =>
      markInScope(graph, index > 0)
    );

    this.graphs = scopes;
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    for (const graph of this.graphs) {
      for await (const key of graph) {
        if (!set.has(key)) {
          set.add(key);
          yield key;
        }
      }
    }
  }

  async get(key) {
    for (const graph of this.graphs) {
      const value = await graph.get(key);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }
}

// Add a wrapper to indicate that, from the perspective of the subgraph, the
// parent is in scope. We use a prototype extension to do this, because we don't
// want to directly modifiy the parent graph.
function markInScope(graph, inScope) {
  if (!!inScope === !!graph.isInScope) {
    // Desired marker is already set (or effectively set).
    return graph;
  }
  const scopeWrapper = {
    isInScope: inScope,
  };
  Object.setPrototypeOf(scopeWrapper, graph);
  return scopeWrapper;
}
