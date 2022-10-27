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
      index > 0 ? markInScope(graph, true) : graph
    );

    this.graphs = scopes;
  }

  async allKeys() {
    const keys = new Set();
    for (const graph of this.graphs) {
      const graphKeys = await (graph.allKeys?.() ??
        ExplorableGraph.keys(graph));
      for (const key of graphKeys) {
        keys.add(key);
      }
    }
    return keys;
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
      if (value instanceof Function) {
        // When returning a function, we want to adjust it so that, if it's
        // called without a call target (`this`), we'll invoke it using this
        // scope as the call target.
        //
        // We do this by returning a Proxy for the function. Beyond letting us
        // intercept the function call, it also: 1) returns the correct `length`
        // property for the function, which is necessary for FunctionGraph to
        // work correctly, and 2) allows us to access any properties hanging off
        // the function, such as documentation used by the ori CLI.
        const scope = this;
        const proxy = new Proxy(value, {
          apply(target, thisArg, args) {
            return Reflect.apply(target, thisArg ?? scope, args);
          },
        });
        return proxy;
      } else if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  async unwatch() {
    for (const graph of this.graphs) {
      await /** @type {any} */ (graph).unwatch?.();
    }
  }
  async watch() {
    for (const graph of this.graphs) {
      await /** @type {any} */ (graph).watch?.();
    }
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
