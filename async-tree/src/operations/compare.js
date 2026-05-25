import { args, isUnpackable, Tree } from "@weborigami/async-tree";

/**
 * Does a pairwise invocation of `compareFn` for each value in the two trees. If
 * one tree has a key that the other doesn't, the  `compareFn` will be invoked
 * with `undefined` for the missing value.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike1
 * @param {Maplike} maplike2
 * @param {function} compareFn
 */
export default async function compare(maplike1, maplike2, compareFn) {
  const tree1 = await args.map(maplike1, "Tree.compare", {
    deep: true,
    position: 1,
  });
  const tree2 = await args.map(maplike2, "Tree.compare", {
    deep: true,
    position: 2,
  });

  if (isUnpackable(compareFn)) {
    compareFn = await compareFn.unpack();
  }
  const fn = args.fn(compareFn, "Tree.compare", {
    position: 3,
  });

  const keys1 = await Tree.keys(tree1);
  const keys2 = await Tree.keys(tree2);
  const keys = new Set([...keys1, ...keys2]);

  const result = {};

  for (const key of keys) {
    const value1 = await tree1.get(key);
    const value2 = await tree2.get(key);

    const comparison =
      Tree.isMap(value1) && Tree.isMap(value2)
        ? await compare(value1, value2, fn)
        : await fn(value1, value2);

    if (comparison) {
      result[key] = comparison;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
