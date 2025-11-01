import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
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
  const sourceMap = await getMapArgument(maplike, "withKeys", { position: 0 });
  const keysMap = await getMapArgument(keysMaplike, "withKeys", {
    position: 1,
  });

  let keys;

  return Object.assign(new AsyncMap(), {
    description: "withKeys",

    async get(key) {
      return sourceMap.get(key);
    },

    async *keys() {
      keys ??= await values(keysMap);
      yield* keys;
    },

    source: sourceMap,
  });
}
