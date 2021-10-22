import ExplorableGraph from "./ExplorableGraph.js";

/**
 * Given a graph and a function, return a new explorable graph that applies
 * the function to the original graph's values.
 */
export default class MapGraph {
  #graph;
  #mapFn;

  /**
   * @param {GraphVariant} variant
   * @param {function} mapFn
   */
  constructor(variant, mapFn) {
    this.#graph = ExplorableGraph.from(variant);
    this.#mapFn = mapFn;
  }

  // Return same keys as original graph.
  async *[Symbol.asyncIterator]() {
    yield* this.#graph;
  }

  // Apply the mapping function to the original graph's values.
  async get(...keys) {
    const value = await this.#graph.get(...keys);
    return ExplorableGraph.isExplorable(value)
      ? new MapGraph(value, this.#mapFn) // Return mapped subgraph
      : value !== undefined
      ? this.#mapFn(value) // Return mapped value
      : undefined;
  }
}
