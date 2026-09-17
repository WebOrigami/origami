import * as args from "../utilities/args.js";

/**
 * @overload
 * @param {import("../../index.ts").AsyncMaplike} maplike
 * @returns {Promise<Array<any>>}
 */

/**
 * @overload
 * @param {import("../../index.ts").SyncMaplike} maplike
 * @returns {Array<any>}
 */

/**
 * @overload
 * @param {import("../../index.ts").Maplike} maplike
 * @returns {Array<any>|Promise<Array<any>>}
 */

/**
 * Return the keys of the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @param {Maplike} maplike
 */
export default function keys(maplike) {
  const map = args.map(maplike, "Tree.keys");
  return map instanceof Map
    ? Array.from(map.keys())
    : Array.fromAsync(map.keys());
}
