import { FunctionTree, isUnpackable } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { toFunction } from "../common/utilities.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Invocable} [invocable]
 */
export default async function fromFn(invocable, keys = []) {
  assertTreeIsDefined(this, "fromFn");
  if (invocable === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  const fn = toFunction(invocable);
  if (isUnpackable(keys)) {
    keys = await keys.unpack();
  }
  const tree = new FunctionTree(fn, keys);
  tree.parent = this;
  return tree;
}
