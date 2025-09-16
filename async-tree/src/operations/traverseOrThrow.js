import TraverseError from "../TraverseError.js";
import { isUnpackable } from "../utilities.js";
import from from "./from.js";

/**
 * Return the value at the corresponding path of keys. Throw if any interior
 * step of the path doesn't lead to a result.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {any}
 * @param {Treelike} treelike
 * @param  {...any} keys
 */
export default async function traverseOrThrow(treelike, ...keys) {
  // Start our traversal at the root of the tree.
  /** @type {any} */
  let value = treelike;
  let position = 0;

  // If traversal operation was called with a `this` context, use that as the
  // target for function calls.
  const target = this;

  // Process all the keys.
  const remainingKeys = keys.slice();
  let key;
  while (remainingKeys.length > 0) {
    if (value == null) {
      throw new TraverseError("A null or undefined value can't be traversed", {
        tree: treelike,
        keys,
        position,
      });
    }

    // If the value is packed and can be unpacked, unpack it.
    if (isUnpackable(value)) {
      value = await value.unpack();
    }

    if (value instanceof Function) {
      // Value is a function: call it with the remaining keys.
      const fn = value;
      // We'll take as many keys as the function's length, but at least one.
      let fnKeyCount = Math.max(fn.length, 1);
      const args = remainingKeys.splice(0, fnKeyCount);
      key = null;
      value = await fn.call(target, ...args);
    } else {
      // Cast value to a tree.
      const tree = from(value);
      // Get the next key.
      key = remainingKeys.shift();
      // Get the value for the key.
      value = await tree.get(key);
    }

    position++;
  }

  return value;
}
