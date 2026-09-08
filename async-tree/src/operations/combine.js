import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import isUnpackable from "../utilities/isUnpackable.js";
import isMap from "./isMap.js";
import keys from "./keys.js";

/**
 * Does a pairwise invocation of `combineFn` for each value in the two trees. If
 * one tree has a key that the other doesn't, the  `combineFn` will be invoked
 * with `undefined` for the missing value.
 *
 * This returns a new tree of all the results of the `combineFn` invocations
 * that were not `undefined`. If all results were `undefined`, the overall
 * result is itself `undefined`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {{ compare: function, includeUndefined?: boolean }} CombineOptions
 *
 * @param {Maplike} maplike1
 * @param {Maplike} maplike2
 * @param {function|CombineOptions} options
 */
export default async function combine(maplike1, maplike2, options) {
  const tree1 = await args.map(maplike1, "Tree.combine", {
    deep: true,
    position: 1,
  });
  const tree2 = await args.map(maplike2, "Tree.combine", {
    deep: true,
    position: 2,
  });

  if (isUnpackable(options)) {
    options = await options.unpack();
  }

  let compareFn;
  let includeUndefined;
  if (typeof options === "function") {
    compareFn = options;
    includeUndefined = false;
  } else if (options && typeof options === "object") {
    compareFn = options.compare;
    includeUndefined = options.includeUndefined ?? false;
  }
  if (isUnpackable(compareFn)) {
    compareFn = await compareFn.unpack();
  }

  const result = new SyncMap();
  result.trailingSlashKeys =
    /** @type {any} */ (tree1).trailingSlashKeys &&
    /** @type {any} */ (tree2).trailingSlashKeys;

  const keys1 = await keys(tree1);
  const keys2 = await keys(tree2);
  const normalized1 = keys1.map(trailingSlash.remove);
  const normalized2 = keys2.map(trailingSlash.remove);
  const combinedKeys = new Set([...normalized1, ...normalized2]);

  for (const key of combinedKeys) {
    // Try the key as is; if not found try toggling a trailing slash
    const value1 =
      (await tree1.get(key)) ?? (await tree1.get(trailingSlash.toggle(key)));
    const value2 =
      (await tree2.get(key)) ?? (await tree2.get(trailingSlash.toggle(key)));

    const combination =
      isMap(value1) && isMap(value2)
        ? await combine(value1, value2, {
            compare: compareFn,
            includeUndefined,
          })
        : await compareFn(value1, value2, key);

    const include = includeUndefined || combination !== undefined;
    if (include) {
      // Use a trailing slash on the key if either of the original trees had it.
      const withSlash = trailingSlash.add(key);
      const setKey =
        keys1.includes(withSlash) || keys2.includes(withSlash)
          ? withSlash
          : key;
      result.set(setKey, combination);
    }
  }

  return result.size > 0 ? result : undefined;
}
