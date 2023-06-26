/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import * as utilities from "./utilities.js";

/**
 * A collection of static methods providing helpers for working with explorable
 * graphs.
 */
export default class ExplorableGraph {
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

class TraverseError extends ReferenceError {
  constructor(message, graph, keys) {
    super(message);
    this.graph = graph;
    this.name = "TraverseError";
    this.keys = keys;
  }
}
