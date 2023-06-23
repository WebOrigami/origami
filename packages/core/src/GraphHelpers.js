import DictionaryHelpers from "./DictionaryHelpers.js";
import FunctionGraph from "./FunctionGraph.js";
import MapGraph from "./MapGraph.js";
import ObjectGraph from "./ObjectGraph.js";
import SetGraph from "./SetGraph.js";

/**
 * Helper functions for working with async graphs
 *
 * @typedef {import("./coreTypes").GraphVariant} GraphVariant
 * @typedef {import("./coreTypes").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncGraph} AsyncGraph
 * @typedef {import("@graphorigami/types").AsyncMutableDictionary} AsyncMutableDictionary
 */
export default class GraphHelpers extends DictionaryHelpers {
  /**
   * Apply the key/values pairs from the source graph to the target graph.
   *
   * If a key exists in both graphs, and the values in both graphs are
   * subgraphs, then the subgraphs will be merged recursively. Otherwise, the
   * value from the source graph will overwrite the value in the target graph.
   *
   * @param {AsyncMutableDictionary} target
   * @param {AsyncGraph} source
   */
  static async assign(target, source) {
    const targetGraph = this.from(target);
    const sourceGraph = this.from(source);
    if (!this.isAsyncMutableDictionary(targetGraph)) {
      throw new TypeError("Target must be a mutable asynchronous graph");
    }
    // Fire off requests to update all keys, then wait for all of them to finish.
    const keys = Array.from(await sourceGraph.keys());
    const promises = keys.map(async (key) => {
      const sourceValue = await sourceGraph.get(key);
      if (this.isAsyncDictionary(sourceValue)) {
        const targetValue = await targetGraph.get(key);
        if (this.isAsyncMutableDictionary(targetValue)) {
          // Both source and target are graphs; recurse.
          await GraphHelpers.assign(targetValue, sourceValue);
          return;
        }
      }
      // Copy the value from the source to the target.
      await /** @type {any} */ (targetGraph).set(key, sourceValue);
    });
    await Promise.all(promises);
    return targetGraph;
  }

  /**
   * Attempts to cast the indicated graph variant to an explorable graph.
   *
   * @param {GraphVariant | Object} variant
   * @returns {AsyncGraph}
   */
  static from(variant) {
    if (this.isAsyncDictionary(variant)) {
      // Argument already supports the dictionary interface.
      // @ts-ignore
      return variant;
    } else if (typeof variant === "object" && "toGraph" in variant) {
      // Variant exposes toGraph() method; invoke it.
      return variant.toGraph();
    } else if (variant instanceof Function) {
      return new FunctionGraph(variant);
    } else if (variant instanceof Map) {
      return new MapGraph(variant);
    } else if (variant instanceof Set) {
      return new SetGraph(variant);
    } else if (variant !== null && typeof variant === "object") {
      // An instance of some class. This is our last choice because it's the
      // least specific.
      return new ObjectGraph(variant);
    }

    throw new TypeError("Couldn't convert argument to an explorable graph");
  }

  /**
   * Returns true if the indicated object can be directly treated as an
   * asynchronous graph. This includes:
   *
   * - An object that implements the AsyncDictionary interface (including
   *   AsyncGraph instances)
   * - An object that implements the `toGraph()` method
   * - A function
   * - An `Array` instance
   * - A `Map` instance
   * - A `Set` instance
   * - A plain object
   *
   * Note: the `from()` method accepts any JavaScript object, but `isGraphable`
   * returns `false` for an object that isn't one of the above types.
   *
   * @param {any} obj
   */
  static isGraphable(obj) {
    return (
      this.isAsyncDictionary(obj) ||
      obj instanceof Function ||
      obj instanceof Array ||
      obj instanceof Set ||
      obj?.toGraph instanceof Function ||
      this.isPlainObject(obj)
    );
  }

  /**
   * Return true if the indicated key produces or is expected to produce an
   * explorable value.
   *
   * This defers to the graph's own isKeyForSubgraph method. If not found, this
   * gets the value of that key and returns true if the value is an async
   * dictionary.
   */
  static async isKeyForSubgraph(graph, key) {
    if (graph.isKeyForSubgraph) {
      return graph.isKeyForSubgraph(key);
    }
    const value = await graph.get(key);
    return this.isGraphable(value);
  }

  /**
   * Given a path like "/foo/bar/baz", return an array of keys like ["foo", "bar",
   * "baz"].
   *
   * If the path ends with a slash, the last key will be `undefined`.
   *
   * @param {string} pathname
   */
  static keysFromPath(pathname) {
    const keys = pathname.split("/");
    if (keys[0] === "") {
      // The path begins with a slash; drop that part.
      keys.shift();
    }
    if (keys[keys.length - 1] === "") {
      // The path ends with a slash; replace that with `undefined`
      // @ts-ignore
      keys[keys.length - 1] = undefined;
    }
    return keys;
  }

  /**
   * Map the values of a graph.
   *
   * @param {GraphVariant} variant
   * @param {Function} mapFn
   */
  static async map(variant, mapFn) {
    const result = new Map();
    const graph = this.from(variant);
    const keys = Array.from(await graph.keys());
    const promises = keys.map((key) =>
      graph.get(key).then(async (value) => {
        // If the value is a subgraph, recurse.
        const fn = this.isAsyncDictionary(value)
          ? this.map(value, mapFn)
          : mapFn(value, key);
        const mappedValue = await fn;
        result.set(key, mappedValue);
      })
    );
    await Promise.all(promises);
    return new MapGraph(result);
  }

  /**
   * Map and reduce a graph.
   *
   * This is done in as parallel fashion as possible. Each of the graph's values
   * will be requested in an async call, then those results will be awaited
   * collectively. If a mapFn is provided, it will be invoked to convert each
   * value to a mapped value; otherwise, values will be used as is. When the
   * values have been obtained, all the values and keys will be passed to the
   * reduceFn, which should consolidate those into a single result.
   *
   * @param {GraphVariant} variant
   * @param {Function|null} mapFn
   * @param {Function} reduceFn
   */
  static async mapReduce(variant, mapFn, reduceFn) {
    const graph = this.from(variant);

    // We're going to fire off all the get requests in parallel, as quickly as
    // the keys come in. We call the graph's `get` method for each key, but
    // *don't* wait for it yet.
    const keys = Array.from(await graph.keys());
    const promises = keys.map((key) =>
      graph.get(key).then((value) =>
        // If the value is a subgraph, recurse.
        this.isAsyncDictionary(value)
          ? this.mapReduce(value, mapFn, reduceFn)
          : mapFn
          ? mapFn(value, key)
          : value
      )
    );

    // Wait for all the promises to resolve. Because the promises were captured
    // in the same order as the keys, the values will also be in the same order.
    const values = await Promise.all(promises);

    // Reduce the values to a single result.
    return reduceFn(values, keys);
  }

  /**
   * Converts an asynchronous graph into a synchronous plain JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * @param {GraphVariant} variant
   * @returns {Promise<PlainObject|Array>}
   */
  static async plain(variant) {
    return this.mapReduce(variant, null, (values, keys) => {
      const obj = {};
      for (let i = 0; i < keys.length; i++) {
        obj[keys[i]] = values[i];
      }
      return castArrayLike(obj);
    });
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {GraphVariant} variant
   * @param {...any} keys
   */
  static async traverse(variant, ...keys) {
    try {
      // Await the result here so that, if the path doesn't exist, the catch
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

      // If someone is trying to traverse this thing, they mean to treat it as a
      // graph. If it's not already a graph, cast it to one.
      const graph = this.from(value);

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
    const keys = this.keysFromPath(path);
    return this.traverse(graph, ...keys);
  }
}

// If the given plain object has only sequential integer keys, return it as an
// array. Otherwise return it as is.
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

// Error class thrown by traverseOrThrow()
class TraverseError extends ReferenceError {
  constructor(message, graph, keys) {
    super(message);
    this.graph = graph;
    this.name = "TraverseError";
    this.keys = keys;
  }
}
