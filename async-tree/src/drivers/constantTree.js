import * as trailingSlash from "../trailingSlash.js";

/**
 * A tree that returns a constant value for any key. If the key ends with a
 * slash, then the same type of subtree is returned.
 *
 * @param {any} constant
 */
export default function constantTree(constant) {
  return {
    async get(key) {
      return trailingSlash.has(key) ? constantTree(constant) : constant;
    },

    async keys() {
      return [];
    },
  };
}
