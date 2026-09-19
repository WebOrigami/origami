import * as args from "../utilities/args.js";
import withKeys from "./withKeys.js";

/**
 * Return a new map with the keys reversed.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
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
  return withKeys(source, reversedKeys);
}
