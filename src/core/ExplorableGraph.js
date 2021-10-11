import YAML from "yaml";
import ExplorableFunction from "./ExplorableFunction.js";
import ExplorableObject from "./ExplorableObject.js";
import { isPlainObject, stringify } from "./utilities.js";

/**
 * A collection of operations that can be performed on explorable graphs.
 */
export default class ExplorableGraph {
  static from(variant) {
    if (this.isExplorable(variant)) {
      // Already explorable
      return variant;
    } else if (typeof variant === "string") {
      return this.parse(variant);
    } else if (typeof variant === "function") {
      return new ExplorableFunction(variant);
    } else if (isPlainObject(variant)) {
      return new ExplorableObject(variant);
    } else {
      throw new TypeError("Could convert object to an explorable graph");
    }
  }

  /**
   * Return true if the given object implements the necessary explorable graph
   * members: a function identified with `Symbol.asyncIterator`, and a function
   * named `get`.
   *
   * @param {any} obj
   */
  static isExplorable(obj) {
    return (
      typeof obj?.[Symbol.asyncIterator] === "function" &&
      typeof obj?.get === "function"
    );
  }

  /**
   * Returns the graph's keys as an array.
   */
  static async keys(graph) {
    const result = [];
    for await (const key of graph) {
      result.push(key);
    }
    return result;
  }

  /**
   * Given a graph and a function, return a new explorable graph that applies
   * the function to the original graph's values.
   *
   * @param {Explorable} graph
   * @param {function} mapFn
   */
  static map(graph, mapFn) {
    return {
      // Return same keys as original graph.
      async *[Symbol.asyncIterator]() {
        yield* graph;
      },

      // Apply the mapping function to the original graph's values.
      async get(...keys) {
        const value = await graph.get(...keys);
        return ExplorableGraph.isExplorable(value)
          ? ExplorableGraph.map(value, mapFn) // Return mapped subgraph
          : value !== undefined
          ? mapFn(value) // Return mapped value
          : undefined;
      },
    };
  }

  static parse(text) {
    const obj = YAML.parse(text);
    return new ExplorableObject(obj);
  }

  /**
   * Converts a graph into a plain JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * @param {Explorable} graph
   */
  static async plain(graph) {
    const result = {};
    for await (const key of graph) {
      const value = await graph.get(key);
      result[String(key)] = ExplorableGraph.isExplorable(value)
        ? await this.plain(value) // Traverse into explorable value.
        : value;
    }
    return result;
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the graph, but with all keys and leaf values cast to strings.
   *
   * @param {Explorable} graph
   */
  static async strings(graph) {
    // Leave plain objects and arrays as is, but stringify other types.
    const stringified = this.map(graph, stringify);
    return this.plain(stringified);
  }

  static async toJson(graph) {
    if (typeof graph === "string") {
      return graph;
    }
    // TODO: plain should get access to graph.obj, can return that immediately
    // for ExplorableObject
    const obj = isPlainObject(graph)
      ? graph
      : await ExplorableGraph.plain(graph);
    return JSON.stringify(obj, null, 2);
  }

  static async toYaml(graph) {
    if (typeof graph === "string") {
      return graph;
    }
    const obj = isPlainObject(graph)
      ? graph
      : await ExplorableGraph.plain(graph);
    return YAML.stringify(obj);
  }
}
