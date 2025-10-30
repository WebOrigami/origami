import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import values from "./values.js";

/**
 * Return a tree whose keys are provided by the _values_ of a second tree (e.g.,
 * an array of keys).
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Maplike} keysMaplike
 * @returns {Promise<AsyncMap>}
 */
export default async function withKeys(maplike, keysMaplike) {
  const tree = await getTreeArgument(maplike, "withKeys", { position: 0 });
  const keysTree = await getTreeArgument(keysMaplike, "withKeys", {
    position: 1,
  });

  let keys;

  return Object.assign(new AsyncMap(), {
    description: "withKeys",

    async get(key) {
      return tree.get(key);
    },

    async *keys() {
      keys ??= await values(keysTree);
      yield* keys;
    },

    source: tree,
  });
}
