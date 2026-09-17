import * as args from "../utilities/args.js";

/**
 * Return the keys of the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default function keys(maplike) {
  const map = args.map(maplike, "Tree.keys");
  return map instanceof Map
    ? Array.from(map.keys())
    : Array.fromAsync(map.keys());
}
