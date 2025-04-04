import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default function take(treelike, count) {
  assertIsTreelike(treelike, "take");
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
