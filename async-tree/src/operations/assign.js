import SyncMap from "../drivers/SyncMap.js";
import from from "./from.js";
import isAsyncMutableTree from "./isAsyncMutableTree.js";
import isTreelike from "./isTreelike.js";
import keys from "./keys.js";

/**
 * Apply the key/values pairs from the source tree to the target tree.
 *
 * If a key exists in both trees, and the values in both trees are
 * subtrees, then the subtrees will be merged recursively. Otherwise, the
 * value from the source tree will overwrite the value in the target tree.
 *
 * @typedef  {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} target
 * @param {Treelike} source
 */
export default async function assign(target, source) {
  const targetTree = from(target);
  const sourceTree = from(source);
  if (!isAsyncMutableTree(targetTree)) {
    throw new TypeError("Target must be a mutable asynchronous tree");
  }
  // Fire off requests to update all keys, then wait for all of them to finish.
  const treeKeys = await keys(sourceTree);
  const promises = treeKeys.map(async (key) => {
    const sourceValue = await sourceTree.get(key);

    if (isTreelike(sourceValue)) {
      let targetValue = await targetTree.get(key);
      if (targetValue === undefined) {
        // Target key doesn't exist; create empty subtree

        // TODO: Once Tree drivers are removed, drop use of empty object
        const empty =
          targetTree instanceof Map
            ? /** @type {any} */ (targetTree.constructor).EMPTY ?? SyncMap.EMPTY
            : {};
        await targetTree.set(key, empty);
        targetValue = await targetTree.get(key);
      }
      // Recurse to copy subtree
      await assign(targetValue, sourceValue);
    } else {
      // Copy the value from the source to the target.
      await targetTree.set(key, sourceValue);
    }
  });
  await Promise.all(promises);
  return targetTree;
}
