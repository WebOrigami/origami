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
export default async function assign(target, source) {
  const targetTree = await args.map(target, "Tree.assign", {
    position: 1,
  });
  const sourceTree = await args.map(source, "Tree.assign", {
    position: 2,
  });
  if ("readOnly" in targetTree && targetTree.readOnly) {
    throw new TypeError("assign: Target must be a read/write map");
  }

  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = [];
  for await (const key of sourceTree.keys()) {
    const promise = (async () => {
      const sourceValue = await sourceTree.get(key);
      if (isMaplike(sourceValue)) {
        // Recurse to copy subtree
        const targetChild = await child(targetTree, key);
        await assign(targetChild, sourceValue);
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
