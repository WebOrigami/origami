import YAML from "yaml";
import ExplorableFunction from "./ExplorableFunction.js";
import ExplorableObject from "./ExplorableObject.js";
import { isPlainObject, toSerializable } from "./utilities.js";

/**
 * A collection of operations that can be performed on explorable graphs.
 */
export default class ExplorableGraph {
  static canCastToExplorable(obj) {
    return (
      this.isExplorable(obj) ||
      typeof obj === "string" ||
      typeof obj === "function" ||
      isPlainObject(obj)
    );
  }

  static from(variant) {
    if (this.isExplorable(variant)) {
      // Already explorable
      return variant;
    } else if (typeof variant === "string" || variant instanceof Buffer) {
      const obj = YAML.parse(String(variant));
      if (isPlainObject(obj)) {
        return new ExplorableObject(obj);
      }
    } else if (typeof variant === "function") {
      return new ExplorableFunction(variant);
    } else if (isPlainObject(variant)) {
      return new ExplorableObject(variant);
    }
    throw new TypeError("Couldn't convert object to an explorable graph");
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
  static async keys(variant) {
    const graph = this.from(variant);
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
   * @param {GraphVariant} variant
   * @param {function} mapFn
   */
  static map(variant, mapFn) {
    const graph = ExplorableGraph.from(variant);
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

  /**
   * Converts a graph into a plain JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * @param {GraphVariant} variant
   */
  static async plain(variant) {
    const graph = this.from(variant);
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
   * Returns the graph in function form.
   *
   * @param {GraphVariant} variant
   */
  static toFunction(variant) {
    const graph = this.from(variant);
    return graph.get.bind(graph);
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the graph, but which can be serialized to text. All keys will be cast to
   * strings, and all values reduced to native JavaScript types as best as
   * possible.
   *
   * @param {GraphVariant} variant
   */
  static async toSerializable(variant) {
    const serializable = this.map(variant, toSerializable);
    return this.plain(serializable);
  }

  static async toJson(variant) {
    const serializable = await this.toSerializable(variant);
    return JSON.stringify(serializable, null, 2);
  }

  static async toYaml(variant) {
    const serializable = await this.toSerializable(variant);
    return YAML.stringify(serializable);
  }

  /**
   * Returns the graph's values as an array.
   */
  static async values(variant) {
    const graph = this.from(variant);
    const result = [];
    for await (const key of graph) {
      result.push(await graph.get(key));
    }
    return result;
  }
}
