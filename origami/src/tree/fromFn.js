import { FunctionTree, isUnpackable } from "@weborigami/async-tree";
import { toFunction } from "../common/utilities.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @param {Invocable} [invocable]
 */
export default async function fromFn(invocable, keys = []) {
  if (invocable === undefined) {
    throw new Error(
      "Tree.fromFn: the first argument must be a function or a tree."
    );
  }
  const fn = toFunction(invocable);
  if (isUnpackable(keys)) {
    keys = await keys.unpack();
  }
  const tree = new FunctionTree(fn, keys);
  return tree;
}
