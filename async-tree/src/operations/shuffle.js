import AsyncMap from "../drivers/AsyncMap.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {boolean?} reshuffle
 * @returns {Promise<AsyncMap>}
 */
export default async function shuffle(maplike, reshuffle = false) {
  const tree = await getTreeArgument(maplike, "shuffle");

  let treeKeys;

  return Object.assign(new AsyncMap(), {
    description: "shuffle",

    async get(key) {
      return tree.get(key);
    },

    async *keys() {
      if (!treeKeys || reshuffle) {
        treeKeys = await keys(tree);
        shuffleArray(treeKeys);
      }
      yield* treeKeys;
    },

    source: tree,
  });
}

/*
 * Shuffle an array.
 *
 * Performs a Fisher-Yates shuffle. From http://sedition.com/perl/javascript-fy.html
 */
export function shuffleArray(array) {
  let i = array.length;
  while (--i >= 0) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
