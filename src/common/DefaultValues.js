import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultValues extends ExplorableGraph {
  constructor(graph, defaults) {
    super();
    this.graph = new ExplorableGraph(graph);
    this.defaults = new ExplorableGraph(defaults);
  }

  async *[Symbol.asyncIterator]() {
    // Only keys from the main graph are returned.
    yield* this.graph[Symbol.asyncIterator]();
  }

  async get(...keys) {
    // Try main graph first.
    // Find route to subgraph that would hold the last key.
    const lastKey = keys.pop();
    if (lastKey === undefined) {
      return undefined; // Nothing to get.
    }

    const subgraph =
      keys.length === 0 ? this.graph : await this.graph.get(...keys);
    if (subgraph === undefined) {
      return undefined; // Can't find subgraph.
    }

    let value = await subgraph.get(lastKey);
    if (value !== undefined) {
      return value; // Found in main graph.
    }

    // Try default values graph next.
    value = await this.defaults.get(lastKey);

    if (value instanceof Function) {
      // Bind to subgraph and invoke.
      value = value.call(subgraph);
    }

    return value;
  }
}
