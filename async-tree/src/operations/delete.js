import * as args from "../utilities/args.js";

/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {any} key
 */
export default async function del(maplike, key) {
  // `delete` is reserved word so can't use that as function name
  const map = await args.map(maplike, "Tree.delete");
  return map.delete(key);
}
