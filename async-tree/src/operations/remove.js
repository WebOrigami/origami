import has from "./has.js";

/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * Note: The corresponding `Map` method is `delete`, not `remove`. However,
 * `delete` is a reserved word in JavaScript, so this uses `remove` instead.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 *
 * @param {AsyncMutableTree} tree
 * @param {any} key
 */
export default async function remove(tree, key) {
  const exists = await has(tree, key);
  if (exists) {
    await tree.set(key, undefined);
    return true;
  } else {
    return false;
  }
}
