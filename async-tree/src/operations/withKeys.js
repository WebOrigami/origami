import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import values from "./values.js";

/**
 * Return a tree whose keys are provided by the _values_ of a second tree (e.g.,
 * an array of keys).
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike} treelike
 * @param {Treelike} keysTreelike
 * @returns {Promise<AsyncTree>}
 */
export default async function withKeys(treelike, keysTreelike) {
  const tree = await getTreeArgument(treelike, "withKeys", { position: 0 });
  const keysTree = await getTreeArgument(keysTreelike, "withKeys", {
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
