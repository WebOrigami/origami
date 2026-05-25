import { args, isStringlike, toString, Tree } from "@weborigami/async-tree";

/**
 * Given an old tree and a new tree, return a tree of changes indicated
 * by the values: "added", "changed", or "deleted".
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} oldMaplike
 * @param {Maplike} newMaplike
 */
export default async function changes(oldMaplike, newMaplike) {
  const oldTree = await args.map(oldMaplike, "Dev.changes", {
    deep: true,
    position: 1,
  });
  const newTree = await args.map(newMaplike, "Dev.changes", {
    deep: true,
    position: 2,
  });

  const comparison = await Tree.compare(oldTree, newTree, compareFn);
  return comparison;
}

function compareFn(oldValue, newValue) {
  if (oldValue !== undefined && newValue === undefined) {
    return "deleted";
  } else if (oldValue === undefined && newValue !== undefined) {
    return "added";
  } else if (isStringlike(oldValue) && isStringlike(newValue)) {
    const oldText = toString(oldValue);
    const newText = toString(newValue);
    return oldText === newText ? undefined : "changed";
  } else {
    return oldValue === newValue ? undefined : "changed";
  }
}
