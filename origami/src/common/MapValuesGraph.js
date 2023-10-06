import { Dictionary, Graph } from "@graphorigami/core";
import * as utilities from "../common/utilities.js";

/**
 * Given a graph and a function, return a new graph that applies the function to
 * the original graph's values.
 */
export default class MapValuesGraph {
  /**
   * @typedef {import("@graphorigami/core").Graphable} Graphable
   * @typedef {import("@graphorigami/core").PlainObject} PlainObject
   * @typedef {import("../..").Invocable} Invocable
   *
   * @param {Graphable} graphable
   * @param {Invocable} mapFn
   * @param {PlainObject} options
   */
  constructor(graphable, mapFn, options = {}) {
    this.graph = Graph.from(graphable);
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
      isSubgraph = Dictionary.isAsyncDictionary(value);
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
    const scope = utilities.getScope(this);
    return this.deep && isSubgraph
      ? // Return mapped subgraph
        Reflect.construct(this.constructor, [value, this.mapFn, this.options])
      : invokeMapFn
      ? await this.mapFn.call(scope, value, key) // Return mapped value
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