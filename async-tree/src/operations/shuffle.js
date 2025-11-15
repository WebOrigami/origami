import AsyncMap from "../drivers/AsyncMap.js";
import getMapArgument from "../utilities/getMapArgument.js";
import keys from "./keys.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {boolean?} reshuffle
 * @returns {Promise<AsyncMap>}
 */
export default async function shuffle(maplike, reshuffle = false) {
  const source = await getMapArgument(maplike, "shuffle");

  let mapKeys;

  return Object.assign(new AsyncMap(), {
    description: "shuffle",

    async get(key) {
      return source.get(key);
    },

    async *keys() {
      if (!mapKeys || reshuffle) {
        mapKeys = await keys(source);
        shuffleArray(mapKeys);
      }
      yield* mapKeys;
    },

    source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
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
