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
    return value && this.isExplorable(value)
      ? // value is also explorable; traverse into it.
        await this.traverse(value, rest)
      : value;
  }
}

// Expose the symbols on the AsyncExplorable class.
Object.assign(AsyncExplorable, { get });
