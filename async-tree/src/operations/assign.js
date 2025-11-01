import getMapArgument from "../utilities/getMapArgument.js";
import isMaplike from "./isMaplike.js";

/**
 * Apply the key/values pairs from the source tree to the target tree.
 *
 * If a key exists in both trees, and the values in both trees are
 * subtrees, then the subtrees will be merged recursively. Otherwise, the
 * value from the source tree will overwrite the value in the target tree.
 *
 * @typedef  {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} target
 * @param {Maplike} source
 */
export default async function assign(target, source) {
  const targetTree = await getMapArgument(target, "assign", { position: 0 });
  const sourceTree = await getMapArgument(source, "assign", { position: 1 });
  if ("readOnly" in targetTree && targetTree.readOnly) {
    throw new TypeError("Target must be a mutable asynchronous tree");
  }
  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = [];
  for await (const key of sourceTree.keys()) {
    const promise = (async () => {
      const sourceValue = await sourceTree.get(key);

      if (isMaplike(sourceValue)) {
        let targetValue = await targetTree.get(key);
        if (targetValue === undefined) {
          // Target key doesn't exist; create empty subtree
          const empty = /** @type {any} */ (targetTree.constructor).EMPTY;
          await targetTree.set(key, empty);
          targetValue = await targetTree.get(key);
        }
        // Recurse to copy subtree
        await assign(targetValue, sourceValue);
      } else {
        // Copy the value from the source to the target.
        await targetTree.set(key, sourceValue);
      }
    })();
    promises.push(promise);
  }
  await Promise.all(promises);
  return targetTree;
}
