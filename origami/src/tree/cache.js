import { Tree, cache } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Caches tree values in a storable cache.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef  {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @param {Treelike} sourceTreelike
 * @param {Treelike} [cacheTreelike]
 * @this {AsyncTree|null}
 */
export default async function cacheBuiltin(sourceTreelike, cacheTreelike) {
  assertTreeIsDefined(this, "cache");
  /** @type {any} */
  const cacheTree = cacheTreelike
    ? Tree.from(cacheTreelike, { parent: this })
    : undefined;
  const result = cache(sourceTreelike, cacheTree);
  return result;
}
