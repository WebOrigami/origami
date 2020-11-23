import { get } from "./symbols.js";

export default class SyncExplorable {
  /**
   * Return true if the given object is explorable.
   *
   * @param {any} obj
   * @returns {boolean}
   */
  static isExplorable(obj) {
    return !!obj[get] && !!obj[Symbol.iterator];
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
Object.assign(SyncExplorable, { get });
