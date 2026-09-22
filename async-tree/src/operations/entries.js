import * as args from "../utilities/args.js";

/**
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").AsyncMaplike} AsyncMaplike
 * @typedef {import("../../index.ts").SyncMaplike} SyncMaplike
 */

/**
 * @overload
 * @param {AsyncMaplike} maplike
 * @returns {Promise<Array<any>>}
 */

/**
 * @overload
 * @param {SyncMaplike} maplike
 * @returns {Array<any>}
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @returns {Array<any>|Promise<Array<any>>}
 */

/**
 * Returns an array of `[key, value]` for each entry in the map.
 *
 * @param {Maplike} maplike
 */
export default function entries(maplike) {
  const map = args.map(maplike, "Tree.entries");
  return map instanceof Map
    ? Array.from(map.entries())
    : Array.fromAsync(map.entries());
}
entries.unpackArgs = true;
