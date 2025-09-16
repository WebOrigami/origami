import { ObjectTree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";
import { castArrayLike, toPlainValue } from "../utilities.js";
import mapReduce from "./mapReduce.js";

/**
 * Converts an asynchronous tree into a synchronous plain JavaScript object.
 *
 * The result's keys will be the tree's keys cast to strings. Any trailing
 * slashes in keys will be removed.
 *
 * Any tree value that is itself a tree will be recursively converted to a plain
 * object.
 *
 * If the tree is array-like (its keys are integers and fill the range
 * 0..length-1), then the result will be an array. The order of the keys will
 * determine the order of the values in the array -- but the numeric value of
 * the keys will be ignored.
 *
 * For example, a tree like `{ 1: "b", 0: "a", 2: "c" }` is array-like because
 * its keys are all integers and fill the range 0..2. The result will be the
 * array `["b", "a", "c" ]` because the tree has the keys in that order. The
 * specific values of the keys (0, 1, and 2) are ignored.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").PlainObject} PlainObject
 *
 * @param {Treelike} treelike
 */
export default async function plain(treelike) {
  return mapReduce(treelike, toPlainValue, (values, keys, tree) => {
    // Special case for an empty tree: if based on array, return array.
    if (tree instanceof ObjectTree && keys.length === 0) {
      return /** @type {any} */ (tree).object instanceof Array ? [] : {};
    }
    // Normalize slashes in keys.
    keys = keys.map(trailingSlash.remove);
    return castArrayLike(keys, values);
  });
}
