import { isUnpackable, SyncMap, Tree } from "@weborigami/async-tree";
import assign from "./assign.js";
import changes from "./changes.js";

export default async function assignChanges(source, target, options, state) {
  if (!state && options) {
    // Shift state from options
    state = options;
    options = {};
  } else {
    options ??= {};
    state ??= {};
  }

  let manifestContainer = options.manifestContainer ?? state.parent;
  let manifestKey = options.manifest ?? "published-files.json";

  if (isUnpackable(source)) {
    source = await source.unpack();
  }
  if (isUnpackable(target)) {
    target = await target.unpack();
  }

  // Get the target manifest
  let targetManifest;
  if (target.manifest) {
    // Ask target for its manifest
    targetManifest = await target.manifest();
  } else {
    // Read in previous manifest
    let previousManifest = await manifestContainer.get(manifestKey);
    if (isUnpackable(previousManifest)) {
      const object = await previousManifest.unpack();
      previousManifest = Tree.from(object, { deep: true });
    }
    targetManifest = previousManifest;
  }

  // Get the current manifest
  const sourceManifest = await Tree.manifest(source);

  // What changed?
  const changeManifest = targetManifest
    ? await changes(targetManifest, sourceManifest)
    : sourceManifest;
  if (!changeManifest) {
    // Nothing changed
    return;
  }

  // Create a tree of the updates. Deleted files will be mapped to undefined,
  // which will have the desired effect of removing them.
  const changedSource = await Tree.mask(source, changeManifest);
  const updates = await combine(
    changedSource,
    changeManifest,
    (value, change) =>
      change === "added" || change === "changed" ? value : undefined,
  );

  await assign(updates, target);

  if (!target.manifest) {
    // Write out source manifest as the previous manifest
    const manifestJson = await Tree.json(sourceManifest);
    await manifestContainer.set(manifestKey, manifestJson);
  }
}
assignChanges.needsState = true;

// Like regular combine() but can return undefined values
async function combine(maplike1, maplike2, fn) {
  const tree1 = await Tree.from(maplike1, { deep: true });
  const tree2 = await Tree.from(maplike2, { deep: true });

  const keys1 = await Tree.keys(tree1);
  const keys2 = await Tree.keys(tree2);
  const combinedKeys = new Set([...keys1, ...keys2]);

  const result = new SyncMap();
  result.trailingSlashKeys =
    /** @type {any} */ (tree1).trailingSlashKeys &&
    /** @type {any} */ (tree2).trailingSlashKeys;

  for (const key of combinedKeys) {
    const value1 = await tree1.get(key);
    const value2 = await tree2.get(key);

    const combination =
      Tree.isMap(value1) && Tree.isMap(value2)
        ? await combine(value1, value2, fn)
        : await fn(value1, value2);

    result.set(key, combination);
  }

  return result;
}
