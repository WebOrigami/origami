import * as args from "../utilities/args.js";

/**
 * Return the number of keys in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function size(maplike) {
  const map = await args.map(maplike, "Tree.size");
  return map.size;
}
