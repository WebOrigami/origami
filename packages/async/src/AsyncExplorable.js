import { get } from "./symbols.js";

export default class AsyncExplorable {
  /**
   * Default implementation returns undefined for any key.
   *
   * @param {any} key
   */
  async [get](key) {
    return undefined;
  }

  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    return !!obj[get] && !!obj[Symbol.asyncIterator];
  }

  /**
   * Returns the keys for an async exfn.
   *
   * @param {any} exfn
   */
  static async keys(exfn) {
    const result = [];
    for await (const key of exfn) {
      result.push(key);
    }
    return result;
  }

  // Default implementation generates an empty list.
  async *[Symbol.asyncIterator]() {
    yield* [];
  }

  /**
   * Converts an exfn into a plain JavaScript object.
   *
   * The result's keys will be the exfn's keys cast to strings. Any exfn value
   * that is itself an exfn will be similarly converted to a plain object.
   *
   * @param {any} exfn
   */
  static async plain(exfn) {
    const result = {};
    for await (const key of exfn) {
      const value = await exfn[get](key);
      // TODO: Check that value is of same constructor before traversing into it.
      result[String(key)] =
        value !== undefined && this.isExplorable(value)
          ? // value is also explorable; traverse into it.
            await this.plain(value)
          : value;
    }
    return result;
  }

  /**
   * Converts an exfn into a plain JavaScript object with the same structure
   * as the original, but with all leaf nodes having a null value.
   *
   * The result's keys will be the exfn's keys cast to strings. Any exfn value
   * that is itself an exfn will be similarly converted to its structure.
   *
   * @param {any} exfn
   */
  static async structure(exfn) {
    const result = {};
    for await (const key of exfn) {
      const value = await exfn[get](key);
      // TODO: Check that value is of same constructor before traversing into it.
      result[String(key)] =
        value !== undefined && this.isExplorable(value)
          ? // value is also explorable; traverse into it.
            await this.structure(value)
          : null;
    }
    return result;
  }

  /**
   * Traverse a graph.
   *
   * @param {any} exfn
   * @param {any[]} path
   * @returns {Promise<any>}
   */
  static async traverse(exfn, path) {
    // Take the first element of the path as the next key.
    const [key, ...rest] = path;
    // Get the value with that key.
    const value = await exfn[get](key);
    // TODO: Check that value is of same constructor before traversing into it.
    return value !== undefined && this.isExplorable(value)
      ? // value is also explorable; traverse into it.
        await this.traverse(value, rest)
      : value;
  }
}

// Expose the symbols on the AsyncExplorable class.
Object.assign(AsyncExplorable, { get });
