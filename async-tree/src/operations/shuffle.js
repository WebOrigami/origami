import AsyncMap from "../drivers/AsyncMap.js";
import * as args from "../utilities/args.js";
import keys from "./keys.js";

/**
 * Return a new tree with the original's keys shuffled.
 *
 * The `randoms` option allows you to provide a function that either returns a
 * random number between 0 and 1 (like `Math.random`) or a random integer. This
 * can be used to create deterministic shuffling.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Stringlike} Stringlike
 *
 * @param {Maplike} maplike
 * @param {{ randoms?: (() => number) }?} options
 * @returns {Promise<AsyncMap>}
 */
export default async function shuffle(maplike, options = {}) {
  const source = await args.map(maplike, "Tree.shuffle");
  const randoms = options?.randoms ?? Math.random;

  let mapKeys;

  return Object.assign(new AsyncMap(), {
    description: "shuffle",

    async get(key) {
      return source.get(key);
    },

    async *keys() {
      if (!mapKeys) {
        mapKeys = await keys(source);
        shuffleArray(mapKeys, randoms);
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
export function shuffleArray(array, randoms) {
  let i = array.length;
  while (--i >= 0) {
    const random = randoms();

    const j =
      random < 1
        ? // Like Math.random
          Math.floor(random * (i + 1))
        : // Random number
          Math.floor(random) % (i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
