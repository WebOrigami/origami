import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {boolean} [reshuffle]
 */
export default async function shuffleTree(treelike, reshuffle = false) {
  // Special case: If the treelike is an array, shuffle it directly. Otherwise
  // we'll end up shuffling the array's indexes, and if this is directly
  // displayed by the ori CLI, this will end up creating a plain object. Even
  // though this object will be created with the keys in the correct shuffled
  // order, a JS object will always return numeric keys in numeric order --
  // undoing the shuffle.
  if (Array.isArray(treelike)) {
    const array = treelike.slice();
    shuffle(array);
    return array;
  }

  const tree = await getTreeArgument(this, arguments, treelike, "shuffle");

  let keys;
  return {
    async get(key) {
      return tree.get(key);
    },

    async keys() {
      if (!keys || reshuffle) {
        keys = Array.from(await tree.keys());
        shuffle(keys);
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
export function shuffle(array) {
  let i = array.length;
  while (--i >= 0) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
