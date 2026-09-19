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
 * Return the keys of the map.
 *
 * @param {Maplike} maplike
 */
export default function keys(maplike) {
  const map = args.map(maplike, "Tree.keys");
  return map instanceof Map
    ? Array.from(map.keys())
    : Array.fromAsync(map.keys());
}
