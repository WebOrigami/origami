import * as args from "../utilities/args.js";
import withKeys from "./withKeys.js";

/**
 * Return a new map with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 * @typedef {(key: any, map: SyncOrAsyncMap) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }} SortOptions
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 *
 * @param {Maplike} maplike
 * @param {SortOptions|ValueKeyFn} [options]
 */
export default function sort(maplike, options = {}) {
  const source = args.map(maplike, "Tree.sort");
  const { compare, sortKey } = args.dictionaryOrFn(
    options,
    "Tree.sort",
    "sortKey",
    {
      compare: { type: "fn", required: false },
      sortKey: { type: "fn", required: false },
    },
    { position: 2 },
  );

  const sortedKeys = 

  return withKeys(source, sortedKeys, { description: "sort" });
}
