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
 * @param {Treelike} [filterTreelike]
 * @this {AsyncTree|null}
 */
export default async function cacheBuiltin(
  sourceTreelike,
  cacheTreelike,
  filterTreelike
) {
  assertTreeIsDefined(this, "tree:cache");
  /** @type {any} */
  const cacheTree = cacheTreelike
    ? Tree.from(cacheTreelike, { parent: this })
    : undefined;
  const result = cache(sourceTreelike, cacheTree, filterTreelike);
  return result;
}
