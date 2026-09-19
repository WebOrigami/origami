import { AsyncMap, SyncMap } from "../internal.js";
import * as ambi from "../utilities/ambi.js";
import * as args from "../utilities/args.js";

/**
 * @typedef {import("../../index.ts").AsyncMaplike} AsyncMaplike
 * @typedef {import("../../index.ts").GeneratorFunction} GeneratorFunction
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").SyncMaplike} SyncMaplike
 * @typedef {import("../../index.ts").SyncOrAsyncGeneratorFunction} SyncOrAsyncGeneratorFunction
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @typedef {{ description?: string }} WithKeysOptions
 */

/**
 * @overload
 * @param {SyncMaplike} maplike
 * @param {GeneratorFunction|SyncMaplike} keysSource
 * @param {WithKeysOptions} [options]
 * @returns {SyncMap}
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {SyncOrAsyncGeneratorFunction|Maplike} keysSource
 * @param {WithKeysOptions} [options]
 * @returns {AsyncMap}
 */

/**
 * Return a map whose keys are provided by the _values_ of a second map (e.g.,
 * an array of keys).
 *
 * @param {Maplike} maplike
 * @param {SyncOrAsyncGeneratorFunction|Maplike} keysSource
 * @param {WithKeysOptions} [options]
 * @returns {SyncOrAsyncMap}
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

  const base = ambi.allSync(source, keysIterator) ? SyncMap : AsyncMap;
  const result = Object.assign(new base(), {
    description,

    get(key) {
      return source.get(key);
    },

    source: source,

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
  /** @type {any} */ (result).keys = keysIterator;

  return result;
}
