import { Tree } from "../internal.js";

/**
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} target
 * @param {Treelike} source
 */
export default async function setDeep(target, source) {
  console.warn("Tree.setDeep is deprecated, use Tree.assign instead.");
  const targetTree = Tree.from(target);
  const sourceTree = Tree.from(source);
  await applyUpdates(sourceTree, targetTree);
}

// Apply all updates from the source to the target.
async function applyUpdates(source, target) {
  // Fire off requests to update all keys, then wait for all of them to finish.
  const promises = [];
  for (const key of await source.keys()) {
    const updateKeyPromise = applyUpdateForKey(source, target, key);
    promises.push(updateKeyPromise);
  }
  await Promise.all(promises);

  // HACK: Transforms like KeysTransform that maintain caches will need to
  // recalculate things now that updates have been applied. This should be an
  // automatic part of calling set() -- but triggering those changes inside
  // set() produces cases where set() and get() calls can be interleaved. The
  // atomicity of set() needs to be reconsidered. For now, we work around the
  // problem by triggering `onChange` after the updates have been applied.
  target.onChange?.();
}

// Copy the value for the given key from the source to the target.
async function applyUpdateForKey(source, target, key) {
  const sourceValue = await source.get(key);
  if (Tree.isAsyncTree(sourceValue)) {
    const targetValue = await target.get(key);
    if (Tree.isAsyncTree(targetValue)) {
      // Both source and target are async dictionaries; recurse.
      await applyUpdates(sourceValue, targetValue);
      return;
    }
  }

  // Copy the value from the source to the target.
  await target.set(key, sourceValue);
}
