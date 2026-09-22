import * as args from "../utilities/args.js";
import withKeys from "./withKeys.js";

/**
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").AsyncMaplike} AsyncMaplike
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").SyncMaplike} SyncMaplike
 * @typedef {import("../../index.ts").SyncMap} SyncMap
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 */

/**
 * @overload
 * @param {AsyncMaplike} maplike
 * @returns {AsyncMap}
 */

/**
 * @overload
 * @param {SyncMaplike} maplike
 * @returns {SyncMap}
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @returns {AsyncMap}
 */

/**
 * Return a new map with the keys reversed.
 *
 * @param {Maplike} maplike
 * @returns {SyncOrAsyncMap}
 */
export default function reverse(maplike) {
  const source = args.map(maplike, "Tree.reverse");
  const reversedKeys =
    source instanceof Map
      ? function* keys() {
          const treeKeys = Array.from(source.keys());
          treeKeys.reverse();
          yield* treeKeys;
        }
      : async function* keys() {
          const treeKeys = await Array.fromAsync(source.keys());
          treeKeys.reverse();
          yield* treeKeys;
        };
  return withKeys(source, reversedKeys, { description: "reverse" });
}
reverse.unpackArgs = true;
