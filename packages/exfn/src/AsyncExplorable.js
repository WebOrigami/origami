import { asyncCall, asyncGet } from "./symbols.js";
// import {
//   default as ExplorableObject,
//   isPlainObject,
// } from "./ExplorableObject.js";

export default class AsyncExplorable {
  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    return !!obj[asyncCall] && !!obj[Symbol.asyncIterator];
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

  static async traverse(exfn, path) {
    if (exfn[asyncGet]) {
      // Treat exfn as a graph.
      // Invoke its "get" method with the first element of the path as a key.
      const [key, ...rest] = path;
      const value = await exfn[asyncGet](key);
      // TODO: Check that value is of same constructor before traversing into it.
      return value && this.isExplorable(value)
        ? // value is also explorable; traverse into it.
          await this.traverse(value, rest)
        : value;
    } else {
      // Basic explorable function.
      // Call it with the path spread into parameters.
      const value = await exfn[asyncCall](...path);
      return value;
    }
  }
}

// Expose the symbols on the AsyncExplorable class.
Object.assign(AsyncExplorable, { asyncCall, asyncGet });
