import { asyncCall, call, get } from "./symbols.js";

export default class SyncExplorable {
  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    // If obj is async, then we defer to that and say it's not a sync exfn.
    const isAsync = !!obj[asyncCall] && !!obj[Symbol.asyncIterator];
    const isSync = !isAsync && !!obj[call] && !!obj[Symbol.iterator];
    return isSync;
  }

  /**
   * Returns the keys for a sync explorable.
   *
   * @param {any} exfn
   */
  static keys(exfn) {
    return [...exfn];
  }
}

// Expose the symbols on the SyncExplorable class.
Object.assign(SyncExplorable, { call, get });
