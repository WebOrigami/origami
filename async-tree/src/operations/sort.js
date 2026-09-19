import sortKeysAsync from "../async/sortKeysAsync.js";
import { SyncMap } from "../internal.js";
import sortKeysSync from "../sync/sortKeysSync.js";
import * as ambi from "../utilities/ambi.js";
import * as args from "../utilities/args.js";
import withKeys from "./withKeys.js";

/**
 * @typedef {(a: any, b: any) => number} CompareFn
 * @typedef {(key: any, map: SyncMap) => any} SyncSortKeyFn
 * @typedef {(key: any, map: SyncOrAsyncMap) => any} SortKeyFn
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").SyncMaplike} SyncMaplike
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {{ compare?: CompareFn, sortKey?: SortKeyFn }} SortOptions
 * @typedef {{ compare?: CompareFn, sortKey?: SyncSortKeyFn }} SyncSortOptions
 */

/**
 * @overload
 * @param {SyncMaplike} maplike
 * @param {SyncSortOptions|ValueKeyFn} [options]
 * @returns {SyncMap}
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {SortOptions|ValueKeyFn} [options]
 * @returns {AsyncMap}
 */

/**
 * Return a new map with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @param {Maplike} maplike
 * @param {SortOptions|SyncSortOptions|ValueKeyFn} [options]
 * @returns {SyncOrAsyncMap}
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

  const allSync =
    source instanceof SyncMap &&
    !(compare instanceof ambi.AsyncFunction) &&
    !(sortKey instanceof ambi.AsyncFunction);
  const sortedKeys = allSync
    ? sortKeysSync(source, compare, sortKey)
    : sortKeysAsync(source, compare, sortKey);

  return withKeys(source, sortedKeys, { description: "sort" });
}
