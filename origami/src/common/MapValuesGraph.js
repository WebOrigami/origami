import { Dictionary, Graph } from "@graphorigami/core";
import addValueKeyToScope from "./addValueKeyToScope.js";
import { getScope, toFunction } from "./utilities.js";

/**
 * Given a graph and a function, return a new graph that applies the function to
 * the original graph's values.
 */
export default class MapValuesGraph {
  /**
   * @typedef {import("@graphorigami/core").Treelike} Graphable
   * @typedef {import("@graphorigami/core").PlainObject} PlainObject
   * @typedef {import("../..").Invocable} Invocable
   *
   * @param {Graphable} graphable
   * @param {Invocable} mapFn
   * @param {PlainObject} options
   */
  constructor(graphable, mapFn, options = {}) {
    this.graph = Graph.from(graphable);
    this.mapFn = toFunction(mapFn);
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
    if (this.getValue || this.graph.isKeyForSubtree === undefined) {
      value = await this.graph.get(key);
      isSubgraph = Dictionary.isAsyncDictionary(value);
      invokeMapFn = value !== undefined;
    } else {
      isSubgraph = await this.graph.isKeyForSubtree(key);
      invokeMapFn = true;
      value = isSubgraph
        ? // Will need to get value to create subgraph.
          await this.graph.get(key)
        : // Don't need value
          undefined;
    }

    if (!invokeMapFn) {
      return undefined;
    }

    const mapFn = addValueKeyToScope(
      getScope(this),
      this.mapFn,
      value,
      key,
      this.options.valueName,
      this.options.keyName
    );

    return this.deep && isSubgraph
      ? // Return mapped subgraph
        Reflect.construct(this.constructor, [value, mapFn, this.options])
      : await mapFn(value); // Return mapped value
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
