import AsyncMap from "../drivers/AsyncMap.js";
import * as ambi from "../utilities/ambi.js";
import * as args from "../utilities/args.js";

/**
 * Return a map whose keys are provided by the _values_ of a second map (e.g.,
 * an array of keys).
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {AsyncGeneratorFunction|GeneratorFunction|Maplike} keysSource
 * @param {{ description?: string }} [options]
 * @returns {AsyncMap}
 */
export default function withKeys(maplike, keysSource, options = {}) {
  const source = args.map(maplike, "Tree.withKeys", {
    position: 1,
  });

  let keysIterator;
  if (
    keysSource instanceof ambi.AsyncGeneratorFunction ||
    keysSource instanceof ambi.GeneratorFunction
  ) {
    keysIterator = keysSource;
  } else if (keysSource instanceof Array) {
    keysIterator = function* () {
      yield* keysSource;
    };
  } else {
    const keysMap = args.map(keysSource, "Tree.withKeys", {
      position: 2,
    });
    keysIterator = keysMap.keys;
  }

  let { description } = args.dictionary(
    options,
    "Tree.withKeys",
    {
      description: { type: "string", required: false },
    },
    {
      position: 3,
    },
  );
  description ??= "withKeys";

  return Object.assign(new AsyncMap(), {
    description,

    async get(key) {
      return source.get(key);
    },

    async *keys() {
      // @ts-ignore
      yield* keysIterator();
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}
