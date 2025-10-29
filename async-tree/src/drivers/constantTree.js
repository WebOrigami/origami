import * as trailingSlash from "../trailingSlash.js";
import SyncMap from "./SyncMap.js";

/**
 * A tree that returns a constant value for any key. If the key ends with a
 * slash, then the same type of subtree is returned.
 *
 * @param {any} constant
 * @returns {SyncMap}
 */
export default function constantTree(constant) {
  return Object.assign(new SyncMap(), {
    get(key) {
      return trailingSlash.has(key) ? constantTree(constant) : constant;
    },

    keys() {
      return [];
    },
  });
}
