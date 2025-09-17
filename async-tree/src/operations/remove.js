import { default as del } from "./delete.js";

/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 *
 * @param {AsyncMutableTree} tree
 * @param {any} key
 */
export default async function remove(tree, key) {
  console.warn("`Tree.remove` is deprecated. Use `Tree.delete` instead.");
  return del(tree, key);
}
