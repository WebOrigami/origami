import { asyncCall, asyncGet } from "./symbols.js";
// import {
//   default as ExplorableObject,
//   isPlainObject,
// } from "./ExplorableObject.js";

export default class AsyncExplorable {
  static isSync(obj) {
    // If obj is async, then we defer to that and say it's not a sync exfn.
    return !this.isAsync(obj) && !!obj[this.call] && !!obj[Symbol.iterator];
  }

  static isAsync(obj) {
    return !!obj[this.asyncCall] && !!obj[Symbol.asyncIterator];
  }

  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    return this.isAsync(obj) || this.isSync(obj);
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
