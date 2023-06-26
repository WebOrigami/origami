/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import MapValuesGraph from "../common/MapValuesGraph.js";
import * as utilities from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A collection of static methods providing helpers for working with explorable
 * graphs.
 */
export default class ExplorableGraph {
  /**
   * Parse the given object as JSON text and return the corresponding explorable
   * graph.
   *
   * Empty text will be treated as an empty object.
   *
   * @param {any} obj
   */
  static fromJson(obj) {
    let parsed = JSON.parse(obj);
    if (parsed === null) {
      // String was empty or just YAML comments.
      parsed = {};
    }
    return new ObjectGraph(parsed);
  }

  /**
   * Parse the given object as YAML text and return the corresponding explorable
   * graph.
   *
   * Empty text (or text with just comments) will be treated as an empty object.
   *
   * @param {any} obj
   */
  static fromYaml(obj) {
    let parsed = utilities.parseYaml(String(obj));
    if (parsed === null) {
      // String was empty or just YAML comments.
      parsed = {};
    }
    return new ObjectGraph(parsed);
  }

  /**
   * Converts an asynchronous explorable graph into a synchronous plain
   * JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * @param {GraphVariant} variant
   * @returns {Promise<PlainObject|Array>}
   */
  static async plain(variant) {
    return GraphHelpers.mapReduce(variant, null, (values, keys) => {
      const obj = {};
      for (let i = 0; i < keys.length; i++) {
        obj[keys[i]] = values[i];
      }
      const result = castArrayLike(obj);
      return result;
    });
  }

  /**
   * Returns the graph in function form.
   *
   * @param {GraphVariant} variant
   * @returns {Function}
   */
  static toFunction(variant) {
    const graph = GraphHelpers.from(variant);
    return graph.get.bind(graph);
  }

  /**
   * Returns the graph as a JSON string.
   *
   * @param {GraphVariant} variant
   */
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
    const serializable = new MapValuesGraph(variant, utilities.toSerializable, {
      deep: true,
    });
    return this.plain(serializable);
  }

  /**
   * Returns the graph as a YAML string.
   *
   * @param {GraphVariant} variant
   * @returns {Promise<string>}
   */
  static async toYaml(variant) {
    const serializable = await this.toSerializable(variant);
    const cast = castArrayLike(serializable);
    return YAML.stringify(cast);
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {GraphVariant} variant
   * @param {...any} keys
   */
  static async traverse(variant, ...keys) {
    try {
      // Await the result here so that, if the file doesn't exist, the catch
      // block below will catch the exception.
      return await this.traverseOrThrow(variant, ...keys);
    } catch (/** @type {any} */ error) {
      if (error instanceof TraverseError) {
        return undefined;
      } else {
        throw error;
      }
    }
  }

  /**
   * Return the value at the corresponding path of keys. Throw if any interior
   * step of the path doesn't lead to a result.
   *
   * @param {GraphVariant} variant
   * @param  {...any} keys
   */
  static async traverseOrThrow(variant, ...keys) {
    // Start our traversal at the root of the graph.
    let value = variant;

    // Process each key in turn.
    // If the value is ever undefined, short-circuit the traversal.
    const remainingKeys = keys.slice();
    while (remainingKeys.length > 0) {
      if (value === undefined) {
        throw new TraverseError(
          `Couldn't traverse the path: ${keys.join("/")}`,
          value,
          keys
        );
      }

      // If the value isn't already explorable, cast it to an explorable graph.
      // If someone is trying to call `get` on this thing, they mean to treat it
      // as an explorable graph.
      const graph = GraphHelpers.from(value);

      // If the graph supports the traverse() method, pass the remaining keys
      // all at once.
      if (graph.traverse) {
        value = await graph.traverse(...remainingKeys);
        break;
      }

      // Otherwise, process the next key.
      const key = remainingKeys.shift();
      value = await graph.get(key);
    }
    return value;
  }

  /**
   * Given a slash-separated path like "foo/bar", traverse the keys "foo" and
   * "bar" and return the resulting value.
   *
   * @param {GraphVariant} graph
   * @param {string} path
   */
  static async traversePath(graph, path) {
    const keys = utilities.keysFromPath(path);
    return ExplorableGraph.traverse(graph, ...keys);
  }

  /**
   * Returns an iterator for the graph's values.
   *
   * @param {GraphVariant} variant
   */
  static async values(variant) {
    const graph = GraphHelpers.from(variant);
    const keys = await graph.keys();
    const promises = Array.from(keys, (key) => graph.get(key));
    return Promise.all(promises);
  }
}

// If the given plain object has only integer keys, return it as an array.
// Otherwise return it as is.
function castArrayLike(obj) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in obj) {
    hasKeys = true;
    const index = Number(key);
    if (isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return obj;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(obj) : obj;
}

class TraverseError extends ReferenceError {
  constructor(message, graph, keys) {
    super(message);
    this.graph = graph;
    this.name = "TraverseError";
    this.keys = keys;
  }
}
