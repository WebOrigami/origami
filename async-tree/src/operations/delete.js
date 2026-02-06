/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {any} key
 */

import getMapArgument from "../utilities/getMapArgument.js";

// `delete` is a reserved word in JavaScript, so we use `del` instead.
export default async function del(maplike, key) {
  const map = await getMapArgument(maplike, "Tree.delete");
  return map.delete(key);
}
