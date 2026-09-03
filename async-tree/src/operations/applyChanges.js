import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import apply from "./apply.js";
import changes from "./changes.js";
import from from "./from.js";
import isMap from "./isMap.js";
import keys from "./keys.js";
import mask from "./mask.js";

/**
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} target
 * @param {Maplike} source
 */
export default async function applyChanges(target, source) {
  const targetTree = await args.map(target, "Tree.applyChanges", {
    position: 1,
  });
  const sourceTree = await args.map(source, "Tree.applyChanges", {
    position: 2,
  });

  const manifestChanges = await changes(targetTree, sourceTree);
  if (!manifestChanges) {
    // No changes to apply
    return;
  }

  // Use the changes as a mask on the source to only get the changed values
  const changedSource = await mask(source, manifestChanges);

  // Create a tree of the updates. Deleted files will be mapped to undefined,
  // which will have the desired effect of removing them.
  const updates = await combine(
    changedSource,
    manifestChanges,
    (value, change) =>
      change === "added" || change === "changed" ? value : undefined,
  );
  if (updates) {
    await apply(target, updates);
  }
}
applyChanges.needsState = true;

// Like regular combine() but can return undefined values
async function combine(maplike1, maplike2, fn) {
  const tree1 = await from(maplike1, { deep: true });
  const tree2 = await from(maplike2, { deep: true });

  const keys1 = await keys(tree1);
  const keys2 = await keys(tree2);
  const combinedKeys = new Set([...keys1, ...keys2]);

  const result = new SyncMap();
  result.trailingSlashKeys =
    /** @type {any} */ (tree1).trailingSlashKeys &&
    /** @type {any} */ (tree2).trailingSlashKeys;

  for (const key of combinedKeys) {
    const value1 = await tree1.get(key);
    const value2 = await tree2.get(key);

    const combination =
      isMap(value1) && isMap(value2)
        ? await combine(value1, value2, fn)
        : await fn(value1, value2);

    result.set(key, combination);
  }

  return result;
}
