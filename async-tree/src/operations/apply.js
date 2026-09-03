import * as args from "../utilities/args.js";
import child from "./child.js";
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
export default async function apply(target, source) {
  const targetTree = await args.map(target, "Tree.apply", {
    position: 1,
  });
  const sourceTree = await args.map(source, "Tree.apply", {
    position: 2,
  });

  // Prefer the target's apply() method if it exists
  if (typeof (/** @type {any} */ (targetTree).apply) === "function") {
    return await /** @type {any} */ (targetTree).apply(sourceTree);
  }

  if ("readOnly" in targetTree && targetTree.readOnly) {
    throw new TypeError("Tree.apply: Target must be a read/write map");
  }

  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = [];
  for await (const key of sourceTree.keys()) {
    const promise = (async () => {
      const sourceValue = await sourceTree.get(key);
      if (isMaplike(sourceValue)) {
        // Recurse to copy subtree
        const targetChild = await child(targetTree, key);
        await apply(targetChild, sourceValue);
      } else if (sourceValue === undefined) {
        // Delete the key from the target.
        await targetTree.delete(key);
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
