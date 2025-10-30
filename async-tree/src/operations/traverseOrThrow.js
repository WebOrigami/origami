import TraverseError from "../TraverseError.js";
import isUnpackable from "../utilities/isUnpackable.js";
import from from "./from.js";

/**
 * Return the value at the corresponding path of keys. Throw if any interior
 * step of the path doesn't lead to a result.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param  {...any} keys
 */
export default async function traverseOrThrow(maplike, ...keys) {
  // Start our traversal at the root of the tree.
  /** @type {any} */
  let value = maplike;
  let position = 0;

  // Process all the keys.
  const remainingKeys = keys.slice();
  let key;
  while (remainingKeys.length > 0) {
    if (value == null) {
      throw new TraverseError("A null or undefined value can't be traversed", {
        tree: maplike,
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
      value = await fn(...args);
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
