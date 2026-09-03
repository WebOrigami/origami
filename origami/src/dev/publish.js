import { args, Tree } from "@weborigami/async-tree";
import showProgress from "./showProgress.js";

/**
 * Call `Tree.publish` while showing publish progress in the console.
 *
 * If a `publishedFiles` option is provided without a `container`, the parent
 * folder will be used as the container for the published files manifest.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 * @param {{ publishedFiles?: { container?: string, key: string }}} options
 * @param {any} state
 */
export default async function publish(source, target, options, state) {
  const sourceTree = await args.map(source, "Dev.publish", {
    position: 1,
  });
  const targetTree = await args.map(target, "Dev.publish", {
    position: 2,
  });

  if (!state && options) {
    // Shift state from options
    state = options;
    options = {};
  } else {
    options ??= {};
    state ??= {};
  }

  const publishedFiles = options.publishedFiles;
  if (publishedFiles && !publishedFiles.container) {
    publishedFiles.container = state.parent;
  }

  const progressOptions = { ...options, publishedFiles };

  return await showProgress(
    1, // wrap writes to the target argument with progress
    Tree.publish,
    sourceTree,
    targetTree,
    progressOptions,
  );
}
publish.needsState = true;
