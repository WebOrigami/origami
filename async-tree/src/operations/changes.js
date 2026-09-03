import * as args from "../utilities/args.js";
import isStringlike from "../utilities/isStringlike.js";
import toString from "../utilities/toString.js";
import combine from "./combine.js";

/**
 * Given an old tree and a new tree, return a tree of changes indicated by the
 * values: "added", "changed", or "deleted".
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} oldMaplike
 * @param {Maplike} newMaplike
 */
export default async function changes(oldMaplike, newMaplike) {
  const oldTree = await args.map(oldMaplike, "Tree.changes", {
    deep: true,
    position: 1,
  });
  const newTree = await args.map(newMaplike, "Tree.changes", {
    deep: true,
    position: 2,
  });

  const combination = await combine(oldTree, newTree, compare);
  return combination;
}

function compare(oldValue, newValue) {
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
