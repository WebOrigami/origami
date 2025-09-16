import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {boolean?} reshuffle
 * @returns {Promise<AsyncTree>}
 */
export default async function shuffle(treelike, reshuffle = false) {
  const tree = await getTreeArgument(treelike, "shuffle");

  let keys;

  return {
    async get(key) {
      return tree.get(key);
    },

    async keys() {
      if (!keys || reshuffle) {
        keys = Array.from(await tree.keys());
        shuffleArray(keys);
      }
      return keys;
    },
  };
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
