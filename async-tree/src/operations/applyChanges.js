import * as args from "../utilities/args.js";
import apply from "./apply.js";
import changes from "./changes.js";
import combine from "./combine.js";
import mask from "./mask.js";

/**
 * Given a target tree and a source tree, this compares the manifests of both
 * trees and applies the changes to the target tree. For network targets, this
 * is a more efficient way to update the target tree than clearing it and
 * copying everything from the source.
 *
 * This returns a tree of changes with with values: "added", "changed", or
 * "deleted". If there were no changes, this returns `undefined`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 */
export default async function applyChanges(source, target) {
  const sourceTree = await args.map(source, "Tree.applyChanges", {
    deep: true,
    position: 1,
  });
  const targetTree = await args.map(target, "Tree.applyChanges", {
    deep: true,
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
  const updates = await combine(changedSource, manifestChanges, {
    compare: (value, change) =>
      change === "added" || change === "changed" ? value : undefined,
    includeUndefined: true,
  });
  if (updates) {
    await apply(updates, target);
  }

  return manifestChanges;
}
applyChanges.needsState = true;
