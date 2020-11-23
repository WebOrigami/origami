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
}

// Expose the symbols on the AsyncExplorable class.
Object.assign(AsyncExplorable, { asyncCall, asyncGet });
