import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import values from "./values.js";

/**
 * Return a map whose keys are provided by the _values_ of a second map (e.g.,
 * an array of keys).
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Maplike} keysMaplike
 * @returns {Promise<AsyncMap>}
 */
export default async function withKeys(maplike, keysMaplike) {
  const source = await args.map(maplike, "Tree.withKeys", {
    position: 1,
  });
  const keysMap = await args.map(keysMaplike, "Tree.withKeys", {
    position: 2,
  });

  let keys;

  return Object.assign(new AsyncMap(), {
    description: "withKeys",

    async get(key) {
      return source.get(key);
    },

    async *keys() {
      keys ??= await values(keysMap);
      yield* keys;
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
