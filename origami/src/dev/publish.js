import { isUnpackable, Tree } from "@weborigami/async-tree";
import copy from "./copy.js";

/**
 * Publish the source tree to the target tree by the most efficient method.
 *
 * - If the target provides a `replaceWith()` method, the source will be passed
 *   to that method.
 * - If the target supports the `manifest()` method, this calls
 *   `Tree.applyChanges()` to update the target tree with the changes in the
 *   source tree, comparing the manifests of both trees to determine what has
 *   changed.
 * - If a `publishedFiles` option is provided, this indicates the container and
 *   the key of a (local) manifest of the files published last time. This
 *   manifest will be compared to the current source manifest to determine what
 *   has changed. The changed files will be assigned to the target via
 *   `Tree.apply()`. The current source manifest will be written to the
 *   container at the key provided.
 * - Otherwise the existing contents of the target will be cleared with
 *   `clear()` before copying everything the source to the target with
 *   `Tree.apply()`.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 * @param {{ publishedFiles?: { container?: string, key?: string }}} options
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

  if (isUnpackable(source)) {
    source = await source.unpack();
  }
  if (isUnpackable(target)) {
    target = await target.unpack();
  }

  if (typeof (/** @type {any} */ (target).replaceWith) === "function") {
    return target.replaceWith(source);
  }

  const targetHasManifest =
    typeof (/** @type {any} */ (target).manifest) === "function";
  if (targetHasManifest) {
    return Tree.applyChanges(target, source);
  }

  const publishedFiles = options.publishedFiles;
  if (publishedFiles) {
    // // Use the published files manifest to determine what changed
    // const container = publishedFiles.container ?? state.parent;
    // const key = publishedFiles.key ?? "published-files.json";
    // // Read in previous manifest
    // let previousManifest = await container.get(key);
    // if (isUnpackable(previousManifest)) {
    //   previousManifest = await previousManifest.unpack();
    // }
  }

  await copy(source, target);

  // if (!target.manifest) {
  //   // Write out source manifest as the previous manifest
  //   const manifestJson = await Tree.json(sourceManifest);
  //   await manifestContainer.set(manifestKey, manifestJson);
  // }
}
publish.needsState = true;
