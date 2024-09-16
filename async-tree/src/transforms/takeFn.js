import { Tree } from "../internal.js";

/**
 * Limit the number of keys to the indicated count.
 *
 * @param {number} count
 */
export default function take(count) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return (treelike) => {
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
  };
}
