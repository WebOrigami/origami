import { isUnpackable, Tree } from "@weborigami/async-tree";
import changes from "./changes.js";
import copy from "./copy.js";

export default async function syncChanges(source, target, options, state) {
  if (!state && options) {
    // Shift state from options
    state = options;
    options = {};
  }
  let manifestContainer = options.manifestContainer ?? state.parent;
  let manifestKey = options.manifest ?? "previous-sync.json";

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

  // Write out added/changed files. As a side effect, deleted files will be
  // mapped to undefined, which will have the desired effect of removing them.
  const updateMask = await Tree.filter(
    changeManifest,
    (value) => value === "added" || value === "changed",
  );
  const updates = await Tree.mask(source, updateMask);
  await copy(updates, target);

  if (!target.manifest) {
    // Write out source manifest as the previous manifest
    const manifestJson = await Tree.json(sourceManifest);
    await manifestContainer.set(manifestKey, manifestJson);
  }
}
syncChanges.needsState = true;
