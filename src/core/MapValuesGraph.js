import ExplorableGraph from "./ExplorableGraph.js";
import * as utilities from "./utilities.js";

/**
 * Given a graph and a function, return a new explorable graph that applies
 * the function to the original graph's values.
 */
export default class MapValuesGraph {
  /**
   * @param {GraphVariant} variant
   * @param {Invocable} mapFn
   * @param {PlainObject} options
   */
  constructor(variant, mapFn, options = {}) {
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
    this.deep = options.deep ?? false;
    this.options = options;
  }

  // Return same keys as original graph.
  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  // Apply the mapping function to the original graph's values.
  async get(key) {
    const value = await this.graph.get(key);
    return this.deep && ExplorableGraph.isExplorable(value)
      ? Reflect.construct(this.constructor, [value, this.mapFn]) // Return mapped subgraph
      : value !== undefined
      ? await this.mapFn.call(this, value, key) // Return mapped value
      : undefined;
  }
}
