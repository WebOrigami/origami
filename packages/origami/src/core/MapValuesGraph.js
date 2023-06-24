import { GraphHelpers } from "@graphorigami/core";
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
    this.getValue = options.getValue ?? true;
    this.options = options;
  }

  /**
   * Retrieves the value for the given key from the original `graph`.
   *
   * @param {any} key
   */
  async get(key) {
    let value;
    let isSubgraph;
    let invokeMapFn;
    if (this.getValue || this.graph.isKeyForSubgraph === undefined) {
      value = await this.graph.get(key);
      isSubgraph = GraphHelpers.isAsyncDictionary(value);
      invokeMapFn = value !== undefined;
    } else {
      isSubgraph = await this.graph.isKeyForSubgraph(key);
      invokeMapFn = true;
      value = isSubgraph
        ? // Will need to get value to create subgraph.
          await this.graph.get(key)
        : // Don't need value
          undefined;
    }
    return this.deep && isSubgraph
      ? // Return mapped subgraph
        Reflect.construct(this.constructor, [value, this.mapFn, this.options])
      : invokeMapFn
      ? await this.mapFn.call(this, value, key) // Return mapped value
      : undefined;
  }

  /**
   * Returns the same keys as the original `graph`.
   */
  async keys() {
    return this.graph.keys();
  }

  async unwatch() {
    return /** @type {any} */ (this.graph).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.graph).watch?.();
  }
}
