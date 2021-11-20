import * as YAMLModule from "yaml";
import ExplorableArray from "./ExplorableArray.js";
import ExplorableFunction from "./ExplorableFunction.js";
import ExplorableObject from "./ExplorableObject.js";
import MapGraph from "./MapGraph.js";
import { isPlainObject, toSerializable } from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A collection of operations that can be performed on explorable graphs.
 */
export default class ExplorableGraph {
  // TODO: Report true for Buffer? Array?
  static canCastToExplorable(obj) {
    return (
      this.isExplorable(obj) ||
      typeof obj === "string" ||
      obj instanceof Function ||
      obj instanceof Array ||
      isPlainObject(obj)
    );
  }

  static from(variant) {
    if (this.isExplorable(variant)) {
      // Already explorable
      return variant;
    }

    // Parse a string/buffer as YAML (which covers JSON too).
    const obj =
      typeof variant === "string" ||
      (globalThis.Buffer && variant instanceof Buffer)
        ? YAML.parse(String(variant))
        : variant;

    // Handle known types.
    if (obj instanceof Function) {
      return new ExplorableFunction(obj);
    } else if (obj instanceof Array) {
      return new ExplorableArray(obj);
    } else if (isPlainObject(obj)) {
      return new ExplorableObject(obj);
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
   * Return true if the indicated key produces or is expected to produce an
   * explorable value.
   *
   * This defers to the graph's own isKeyExplorable method. If not found, this
   * gets the value of that key and returns true if the value is in fact
   * explorable.
   *
   * REVIEW: The name of this suggested that it examines whether the key itself
   * is explorable, but really it's the value that matters. Calling this
   * `isValueExplorable`, on the other hand, makes it sound like it takes a
   * value argument instead of a key. `isKeyValueExplorable` is long.
   */
  static async isKeyExplorable(graph, key) {
    if (graph.isKeyExplorable) {
      return await graph.isKeyExplorable(key);
    }
    const value = graph.get(key);
    return this.isExplorable(value);
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

  static async toJson(variant) {
    const serializable = await this.toSerializable(variant);
    const cast = castArrayLike(serializable);
    return JSON.stringify(cast, null, 2);
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
    const serializable = new MapGraph(variant, toSerializable);
    return this.plain(serializable);
  }

  static async toYaml(variant) {
    const serializable = await this.toSerializable(variant);
    const cast = castArrayLike(serializable);
    return YAML.stringify(cast);
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {Explorable} graph
   * @param {...any} keys
   */
  static async traverse(graph, ...keys) {
    // If the graph's get method accepts multiple keys, pass them all at once.
    if (graph.get?.length !== 1) {
      return await graph.get(...keys);
    }

    // Start our traversal at the root of the graph.
    let value = graph;
    for (const key of keys) {
      // If the value isn't already explorable, cast it to an explorable graph.
      // The implication is that, if someone is trying to call `get` on this
      // thing, they mean to treat it as an explorable graph.
      const subgraph = ExplorableGraph.from(value);

      // Ask the graph to get the value of the key.
      value = await subgraph.get(key);

      // If the value is undefined, we short-circuit the traversal.
      if (value === undefined) {
        return undefined;
      }
    }
    return value;
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

// If the given plain object has only integer keys, return it as an array.
// Otherwise return it as is.
function castArrayLike(obj) {
  const array = [];
  for (const key of Object.keys(obj)) {
    const index = Number(key);
    if (isNaN(index)) {
      // Not an array-like object.
      return obj;
    }
    array[index] = obj[key];
  }
  return array.length > 0 ? array : obj;
}
