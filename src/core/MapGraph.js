import ExplorableGraph from "./ExplorableGraph.js";
import * as utilities from "./utilities.js";

const graphKey = Symbol("graph");
const mapFnKey = Symbol("mapFn");

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
    this[graphKey] = ExplorableGraph.from(variant);
    this[mapFnKey] = utilities.toFunction(mapFn);
  }

  // Return same keys as original graph.
  async *[Symbol.asyncIterator]() {
    yield* this[graphKey];
  }

  // Apply the mapping function to the original graph's values.
  async get(key) {
    const value = await this[graphKey].get(key);
    return ExplorableGraph.isExplorable(value)
      ? new MapGraph(value, this[mapFnKey]) // Return mapped subgraph
      : value !== undefined
      ? await this[mapFnKey](value, key) // Return mapped value
      : undefined;
  }
}
