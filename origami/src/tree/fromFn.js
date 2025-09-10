import { FunctionTree, isUnpackable, toFunction } from "@weborigami/async-tree";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/async-tree").Invocable} Invocable
 *
 * @param {Invocable} invocable
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
