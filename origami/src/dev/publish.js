import { isUnpackable, Tree } from "@weborigami/async-tree";
import changes from "./changes.js";
import copy from "./copy.js";

/**
 * Publish the source tree to the target tree by the most efficient method.
 *
 * - If both the source and target trees support the `manifest()` method, then
 *   the manifests of both trees will be compared to determine what has changed.
 *   The changed files will be assigned to the target via `assign()`.
 * - If a `publishedManifest` option is provided, this indicates the container
 *   and the key of a (local) manifest of the files published last time. This
 *   manifest will be compared to the current source manifest to determine what
 *   has changed. The changed files will be assigned to the target via
 *   `assign()`. The current source manifest will be written to the container at
 *   the key provided.
 * - If the target provides a `replaceWith()` method, the source will be passed
 *   to that method.
 * - Otherwise the existing contents of the target will be cleared with
 *   `clear()`, and the source tree will be traversed and assigned to the target
 *   via `assign()`.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 * @param {*} options
 * @param {any} state
 */
export default async function publish(source, target, options, state) {
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

  await copy(updates, target);

  if (!target.manifest) {
    // Write out source manifest as the previous manifest
    const manifestJson = await Tree.json(sourceManifest);
    await manifestContainer.set(manifestKey, manifestJson);
  }
}
publish.needsState = true;
