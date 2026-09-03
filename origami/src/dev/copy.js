import { args, Tree } from "@weborigami/async-tree";
import showProgress from "./showProgress.js";

/**
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 */
export default async function copy(source, target) {
  const sourceTree = await args.map(source, "Dev.copy", { position: 1 });
  let targetTree = await args.map(target, "Dev.copy", { position: 2 });
  await showProgress(
    1, // Wrap writes to the target argument with progress
    Tree.apply,
    sourceTree,
    targetTree,
  );
}
