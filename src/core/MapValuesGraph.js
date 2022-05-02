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

  /**
   * Returns the same keys as the original `graph`.
   */
  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  /**
   * Retrieves the value for the given key from the original `graph`.
   * 
   * @param {any} key 
   */
  async get(key) {
    const value = await this.graph.get(key);
    return this.deep && ExplorableGraph.isExplorable(value)
      ? // Return mapped subgraph
        Reflect.construct(this.constructor, [value, this.mapFn, this.options])
      : value !== undefined
      ? await this.mapFn.call(this, value, key) // Return mapped value
      : undefined;
  }
}
