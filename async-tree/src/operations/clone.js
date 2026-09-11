import * as args from "../utilities/args.js";
import awaitValues from "./awaitValues.js";

/**
 * Return a copy of the given maplike object.
 *
 * This is currently an alias for awaitValues(), which ends up cloning a tree.
 *
 * @param {import("../../index.ts").Maplike} maplike
 */
export default async function clone(maplike) {
  const source = await args.map(maplike, "Tree.clone", { deep: true });
  const cloned = await awaitValues(source);
  return cloned;
}
