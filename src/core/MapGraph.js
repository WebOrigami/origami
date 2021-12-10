import ExplorableGraph from "./ExplorableGraph.js";
import * as utilities from "./utilities.js";

/**
 * Given a graph and a function, return a new explorable graph that applies
 * the function to the original graph's values.
 */
export default class MapGraph {
  /**
   * @param {GraphVariant} variant
   * @param {function} mapFn
   */
  constructor(variant, mapFn) {
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
  }

  // Return same keys as original graph.
  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  // Apply the mapping function to the original graph's values.
  async get(key) {
    const value = await this.graph.get(key);
    return ExplorableGraph.isExplorable(value)
      ? new MapGraph(value, this.mapFn) // Return mapped subgraph
      : value !== undefined
      ? await this.mapFn(value, key) // Return mapped value
      : undefined;
  }
}
