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
