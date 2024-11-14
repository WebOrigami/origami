import { Tree } from "../internal.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default function take(treelike, count) {
  if (!treelike) {
    const error = new TypeError(`take: The tree to take from isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const tree = Tree.from(treelike);

  return {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.slice(0, count);
    },

    async get(key) {
      return tree.get(key);
    },
  };
}
