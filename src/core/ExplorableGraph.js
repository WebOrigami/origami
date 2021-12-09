import * as YAMLModule from "yaml";
import ExplorableArray from "./ExplorableArray.js";
import ExplorableFunction from "./ExplorableFunction.js";
import ExplorableObject from "./ExplorableObject.js";
import MapGraph from "./MapGraph.js";
import * as utilities from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A collection of operations that can be performed on explorable graphs.
 */
export default class ExplorableGraph {
  // TODO: Report true for Buffer?
  static canCastToExplorable(obj) {
    return (
      this.isExplorable(obj) ||
      typeof obj === "string" ||
      obj instanceof Function ||
      obj instanceof Array ||
      utilities.isPlainObject(obj)
    );
  }

  static from(variant) {
    // Use the object's toGraph() method if defined.
    let obj = variant;
    while (typeof obj.toGraph === "function") {
      obj = obj.toGraph();
    }

    if (this.isExplorable(obj)) {
      // Object itself supports the ExplorableGraph interface.
      return obj;
    }

    // Parse a string/buffer as YAML (which covers JSON too).
    if (
      typeof variant === "string" ||
      (globalThis.Buffer && variant instanceof Buffer)
    ) {
      obj = utilities.parse(String(obj));
    }

    // Handle known types.
    if (obj instanceof Function) {
      return new ExplorableFunction(obj);
    } else if (obj instanceof Array) {
      return new ExplorableArray(obj);
    } else if (utilities.isPlainObject(obj)) {
      return new ExplorableObject(obj);
    } else if (typeof obj.toFunction === "function") {
      const fn = obj.toFunction();
      return new ExplorableFunction(fn);
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
   * Converts an asynchronous explorable graph into a synchronous plain
   * JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   * This is done in as parallel fashion as possible. For each graph key, we
   * fire off all the get requests for those values as once, then add them to
   * the resulting object as the values come in.
   *
   * @param {GraphVariant} [variant]
   */
  static async plain(variant) {
    const graph = this.from(variant);
    const result = {};

    // We're going to fire off all the get requests in parallel, as quickly as
    // the keys come in.
    let promises = [];
    for await (const key of graph) {
      // Create a key in the result object at this point as a placeholder so
      // that, even if this value takes a long time to resolve, the key will
      // still appear at the proper place in the result.
      result[key] = undefined;

      // Call the graph's `get` method, but *don't* wait for it yet.
      const valuePromise = graph.get(key).then(async (value) => {
        // If the value is itself a graph, recurse.
        // Once we have a final value, add it to the result.
        // The value will appear in the place reserved for it earlier.
        result[key] = this.isExplorable(value)
          ? await this.plain(value)
          : value;
      });
      promises.push(valuePromise);
    }

    // Wait for all the promises to resolve.
    await Promise.all(promises);

    return result;
  }

  /**
   * Returns the graph in function form.
   *
   * @param {GraphVariant} [variant]
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
    const serializable = new MapGraph(variant, utilities.toSerializable);
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
   * @param {Explorable} variant
   * @param {...any} keys
   */
  static async traverse(variant, ...keys) {
    try {
      return await this.traverseOrThrow(variant, ...keys);
    } catch (/** @type {any} */ error) {
      if (error instanceof ReferenceError) {
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
   * @param {Explorable} variant
   * @param  {...any} keys
   * @returns
   */
  static async traverseOrThrow(variant, ...keys) {
    // Start our traversal at the root of the graph.
    let value = variant;

    // Process each key in turn.
    // If the value is ever undefined, short-circuit the traversal.
    const remainingKeys = keys.slice();
    while (remainingKeys.length > 0) {
      if (value === undefined) {
        throw new ReferenceError(
          `Couldn't traverse the path: ${keys.join("/")}`
        );
      }

      // If the value isn't already explorable, cast it to an explorable graph.
      // If someone is trying to call `get` on this thing, they mean to treat it
      // as an explorable graph.
      const graph = ExplorableGraph.from(value);

      // If the graph's get method accepts multiple keys, pass the remaining
      // keys all at once.
      if (graph.get.length !== 1) {
        value = await graph.get(...remainingKeys);
        break;
      }

      // Otherwise, process the next key.
      const key = remainingKeys.shift();
      value = await graph.get(key);
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
