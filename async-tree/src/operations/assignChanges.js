import * as args from "../utilities/args.js";
import assign from "./assign.js";
import changes from "./changes.js";
import combine from "./combine.js";

/**
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} target
 * @param {Maplike} source
 */
export default async function assignChanges(target, source) {
  const targetTree = await args.map(target, "Tree.assignChanges", {
    position: 1,
  });
  const sourceTree = await args.map(source, "Tree.assignChanges", {
    position: 2,
  });

  const manifestChanges = await changes(sourceTree, targetTree);
  if (!manifestChanges) {
    // No changes to apply
    return;
  }

  // Create a tree of the updates. Deleted files will be mapped to undefined,
  // which will have the desired effect of removing them.
  const updates = await combine(sourceTree, manifestChanges, (value, change) =>
    change === "added" || change === "changed" ? value : undefined,
  );
  if (updates) {
    await assign(updates, target);
  }
}
assignChanges.needsState = true;
