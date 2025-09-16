import FunctionTree from "../drivers/FunctionTree.js";
import isUnpackable from "../utilities/isUnpackable.js";
import toFunction from "../utilities/toFunction.js";

/**
 * Create a tree from a function and a set of keys.
 *
 * @typedef {import("@weborigami/async-tree").Invocable} Invocable
 *
 * @param {Invocable} invocable
 */
export default async function fromFn(invocable, keys = []) {
  console.warn("Tree.fromFn is deprecated, use Tree.withKeys instead.");
  if (invocable === undefined) {
    throw new Error(
      "Tree.fromFn: the first argument must be a function or a tree."
    );
  }
  const fn = toFunction(invocable);
  if (isUnpackable(keys)) {
    keys = await keys.unpack();
  }
  // @ts-ignore
  const tree = new FunctionTree(fn, keys);
  return tree;
}
