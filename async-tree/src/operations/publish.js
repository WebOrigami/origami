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
 * - If a `publishedFiles` option is provided, this indicates the container and
 *   the key of a (typically local) manifest of the files published last time.
 *   This manifest will be compared to the current source manifest to determine
 *   what has changed. The changed files will be assigned to the target via
 *   `Tree.apply()`, and then the current source manifest will be written back
 *   to the same container and key provided.
 * - Otherwise the existing contents of the target will be cleared with
 *   `clear()` before copying everything the source to the target with
 *   `Tree.apply()`.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {Maplike} source
 * @param {Maplike} target
 * @param {{ publishedFiles?: { container?: SyncOrAsyncMap, key: string }}} options
 */
export default async function publish(source, target, options = {}) {
  const sourceTree = await args.map(source, "Tree.publish", {
    position: 1,
  });
  const targetTree = await args.map(target, "Tree.publish", {
    position: 2,
  });

  if (typeof (/** @type {any} */ (target).replaceWith) === "function") {
    return /** @type {any} */ (target).replaceWith(sourceTree);
  }

  const targetHasManifest =
    typeof (/** @type {any} */ (target).manifest) === "function";
  if (targetHasManifest) {
    return applyChanges(targetTree, sourceTree);
  }

  const publishedFiles = options.publishedFiles;
  const publishedFilesContainer = publishedFiles?.container;
  const publishedFilesKey = publishedFiles?.key;
  let sourceManifest;
  let targetManifest;
  let changes;
  if (publishedFiles) {
    // Use the published files manifest to determine what changed
    if (!publishedFilesContainer) {
      throw new Error("Missing `container` property for publishedFiles option");
    }
    if (!publishedFilesKey) {
      throw new Error("Missing `key` property for publishedFiles option");
    }

    // Read in published files and use it as the target manifest. If we don't
    // find an existing manifest, we'll fall through to do a full copy.
    targetManifest = await publishedFilesContainer.get(publishedFilesKey);
    if (isUnpackable(targetManifest)) {
      targetManifest = await targetManifest.unpack();
    }

    if (targetManifest) {
      // Extend the source and target to use our copies of those manifests
      sourceManifest = await manifest(sourceTree);
      const extendedSource = Object.create(sourceTree);
      extendedSource.manifest = () => sourceManifest;
      const extendedTarget = Object.create(targetTree);
      extendedTarget.manifest = () => targetManifest;
      changes = await applyChanges(extendedTarget, extendedSource);
    }
  }

  if (!targetManifest) {
    // No manifest specified or found, do a full copy
    await apply(sourceTree, targetTree);
  }

  if (changes && sourceManifest && publishedFilesContainer) {
    // Write out source manifest as the previous manifest
    const manifestJson = await json(sourceManifest);
    await publishedFilesContainer.set(publishedFilesKey, manifestJson);
  }
}
