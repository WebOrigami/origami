import * as args from "../utilities/args.js";
import isUnpackable from "../utilities/isUnpackable.js";
import apply from "./apply.js";
import applyChanges from "./applyChanges.js";
import json from "./json.js";
import manifest from "./manifest.js";

/**
 * Make the target tree match the source tree by the most efficient method.
 *
 * - If the target provides its own `replaceWith()` method, the source will be
 *   passed to that method.
 * - If the target supports its own `manifest()` method, this calls
 *   `Tree.applyChanges()` to update the target tree with the changes in the
 *   source tree, comparing the manifests of both trees to determine what has
 *   changed.
 * - If a `manifestContainer` and `manifest` options are provided, this
 *   indicates the container and name of a (typically local) manifest of the
 *   files published last time. This manifest will be compared to the current
 *   source manifest to determine what has changed. The changed files will be
 *   assigned to the target via `Tree.apply()`, and then the current source
 *   manifest will be written back to the same container and name provided.
 * - Otherwise the existing contents of the target will be cleared with
 *   `clear()` before copying everything the source to the target with
 *   `Tree.apply()`.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {Maplike} source
 * @param {Maplike} target
 * @param {{ manifestContainer?: SyncOrAsyncMap, manifest?: string }} options
 */
export default async function publish(source, target, options = {}) {
  const sourceTree = await args.map(source, "Tree.publish", {
    deep: true,
    position: 1,
  });
  const targetTree = await args.map(target, "Tree.publish", {
    deep: true,
    position: 2,
  });

  if (typeof (/** @type {any} */ (target).replaceWith) === "function") {
    // Use target's replaceWith() method
    return /** @type {any} */ (target).replaceWith(sourceTree);
  }

  const targetHasManifest =
    typeof (/** @type {any} */ (target).manifest) === "function";
  if (targetHasManifest) {
    return applyChanges(targetTree, sourceTree);
  }

  // Explicit manifest options
  const manifestContainer = options.manifestContainer;
  const manifestKey = options.manifest;

  let sourceManifest;
  let targetManifest;
  let changes;
  if (manifestKey) {
    // Use the indicated manifest to determine what changed.

    if (!manifestContainer) {
      throw new Error("Missing `manifestContainer` for manifest option");
    }

    // Read in the manifest to use as the target manifest. If we don't find an
    // existing manifest, we'll fall through to do a full copy.
    targetManifest = await manifestContainer.get(manifestKey);
    if (isUnpackable(targetManifest)) {
      try {
        targetManifest = await targetManifest.unpack();
      } catch (error) {
        // Treat unpacking errors as a missing manifest
        targetManifest = null;
      }
    }

    // Extend the source and target to use our copies of those manifests
    sourceManifest = await manifest(sourceTree);
    if (targetManifest) {
      const extendedSource = Object.create(sourceTree);
      extendedSource.manifest = () => sourceManifest;
      const extendedTarget = Object.create(targetTree);
      extendedTarget.manifest = () => targetManifest;
      changes = await applyChanges(extendedSource, extendedTarget);
    }
  }

  if (!targetManifest) {
    // No manifest specified or found, do a full copy
    await apply(sourceTree, targetTree);
  }

  if ((!targetManifest || changes) && sourceManifest && manifestContainer) {
    // Write out source manifest as the previous manifest
    const manifestJson = await json(sourceManifest);
    await manifestContainer.set(manifestKey, manifestJson);
  }
}
