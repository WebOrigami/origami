import SyncMap from "../drivers/SyncMap.js";
import * as args from "../utilities/args.js";
import keys from "./keys.js";
import withKeys from "./withKeys.js";

/**
 * Return a new tree with the original's keys shuffled.
 *
 * The `randoms` option allows you to provide a function that either returns a
 * random number between 0 and 1 (like `Math.random`) or a random integer. This
 * can be used to create deterministic shuffling.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Stringlike} Stringlike
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {Maplike} maplike
 * @param {{ randoms?: (() => number) }} [options]
 * @returns {SyncOrAsyncMap}
 */
export default function shuffle(maplike, options = {}) {
  const source = args.map(maplike, "Tree.shuffle");
  let { randoms } = args.dictionary(
    options,
    "Tree.shuffle",
    {
      randoms: { type: "fn", required: false },
    },
    { position: 2 },
  );
  randoms = randoms ?? Math.random;

  let mapKeys;
  let shuffledKeys;
  if (source instanceof SyncMap) {
    shuffledKeys = function* () {
      if (!mapKeys) {
        mapKeys = Array.from(source.keys());
        shuffleArray(mapKeys, randoms);
      }
      yield* mapKeys;
    };
  } else {
    shuffledKeys = async function* () {
      if (!mapKeys) {
        mapKeys = await keys(source);
        shuffleArray(mapKeys, randoms);
      }
      yield* mapKeys;
    };
  }

  return withKeys(source, shuffledKeys, { description: "shuffle" });
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
