import * as trailingSlash from "../trailingSlash.js";
import SyncMap from "./SyncMap.js";

/**
 * A tree that returns a constant value for any key. If the key ends with a
 * slash, then the same type of subtree is returned.
 *
 * @param {any} constant
 * @returns {SyncMap}
 */
export default class ConstantTree extends SyncMap {
  constructor(constant) {
    super();
    this.constant = constant;
  }

  get(key) {
    return trailingSlash.has(key)
      ? new ConstantTree(this.constant)
      : this.constant;
  }

  keys() {
    return [][Symbol.iterator]();
  }
}
