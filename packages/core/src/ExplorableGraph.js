import { isPlainObject } from "./utilities.js";

export default class ExplorableGraph {
  constructor(obj) {
    if (obj instanceof ExplorableGraph) {
      // Return object as is.
      return obj;
    } else if (isPlainObject(obj)) {
      return new ExplorableObject(obj);
    }
  }

  /**
   * @returns {AsyncIterableIterator<any>}
   */
  async *[Symbol.asyncIterator]() {
    yield* [];
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * Default implementation returns undefined for any key.
   *
   * @param {...any} keys
   * @returns {Promise<any>}
   */
  async get(...keys) {}

  // We define `obj instanceof ExplorableGraph` for any object that has the async
  // properties we need: Symbol.asyncIterator and a `get` method.
  static [Symbol.hasInstance](obj) {
    return obj && obj[Symbol.asyncIterator] && obj.get instanceof Function;
  }

  /**
   * Returns the graph's keys as an array.
   *
   * @returns {Promise<any[]>}
   */
  async keys() {
    const result = [];
    for await (const key of this) {
      result.push(key);
    }
    return result;
  }

  /**
   * Create a plain JavaScript object with the graph's keys cast to strings,
   * and the given `mapFn` applied to values.
   *
   * @param {function} mapFn
   */
  async mapValues(mapFn) {
    const result = {};
    for await (const key of this) {
      const value = await this.get(key);
      // TODO: Check that value is of same constructor before traversing into it?
      result[String(key)] =
        value instanceof ExplorableGraph
          ? // value is also explorable; traverse into it.
            await value.mapValues(mapFn)
          : await mapFn(value);
    }
    return result;
  }

  /**
   * Converts a graph into a plain JavaScript object.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to a plain object.
   *
   */
  async plain() {
    return await this.mapValues((value) => value);
  }

  async resolve(value, path) {
    let result;
    if (value instanceof Function) {
      result = await value(...path);
    } else if (value instanceof ExplorableGraph) {
      const graph = Reflect.construct(this.constructor, [value]);
      result = path.length === 0 ? graph : await graph.get(...path);
    } else if (path.length === 0) {
      result = value;
    }
    return result;
  }

  /**
   * Converts the graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values cast to strings.
   */
  async strings() {
    return await this.mapValues(async (value) => {
      const obj = await value;
      // If obj is a primitive type, we won't be able to call toString
      return obj.toString ? obj.toString() : "";
    });
  }

  /**
   * Converts a graph into a plain JavaScript object with the same structure
   * as the original, but with all leaf values being `null`.
   *
   * The result's keys will be the graph's keys cast to strings. Any graph value
   * that is itself a graph will be similarly converted to its structure.
   */
  async structure() {
    return await this.mapValues(() => null);
  }

  /**
   * Performs a depth-first traversal of the explorable.
   *
   * Note: This does not check for or prevent cycles.
   *
   * @param {function} callback
   * @param {any[]} [route]
   */
  async traverse(callback, route = []) {
    for await (const key of this) {
      const extendedRoute = [...route, key];
      const value = await this.get(key);
      const interior = value instanceof ExplorableGraph;
      await callback(extendedRoute, interior, value);
      if (interior) {
        await value.traverse(callback, extendedRoute);
      }
    }
  }
}

export class ExplorableObject extends ExplorableGraph {
  constructor(obj) {
    super();
    this.obj = obj;
  }

  async *[Symbol.asyncIterator]() {
    // If the object defines an iterator, defer to that.
    if (this.obj[Symbol.asyncIterator]) {
      yield* this.obj[Symbol.asyncIterator]();
    } else {
      // Iterate over the object's keys.
      yield* Object.keys(this.obj);
    }
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {...any} keys
   */
  async get(...keys) {
    // If the object defines its own `get` method, defer to that.
    if (typeof this.obj.get === "function") {
      return this.obj.get(...keys);
    }

    // Traverse the keys.
    let value = this.obj;
    while (value !== undefined && keys.length > 0) {
      const key = keys.shift();
      value = value[key];
      if (value instanceof ExplorableGraph && keys.length > 0) {
        return value.get(...keys);
      }
    }

    return keys.length > 0
      ? undefined
      : isPlainObject(value)
      ? Reflect.construct(this.constructor, [value])
      : value;
  }

  /**
   * Add or overwrite the value at a given location in the graph. Given a set
   * of arguments, take the last argument as a value, and the ones before it
   * as a path. If only one argument is supplied, use that as a key, and take
   * the value as undefined.
   *
   * @param  {...any} args
   */
  async set(...args) {
    if (args.length === 0) {
      // No-op
      return;
    }
    const value = args.length === 1 ? undefined : args.pop();
    const keys = args;

    // Traverse the keys
    let current = this.obj;
    while (keys.length > 1) {
      const key = keys.shift();
      let next = current[key];
      if (!isPlainObject(next)) {
        // Overwrite path
        next = {};
        current[key] = next;
      }
      current = next;
    }

    const key = keys.shift();
    if (value === undefined) {
      delete current[key];
    } else {
      current[key] = value;
    }
  }
}
