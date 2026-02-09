import * as trailingSlash from "../trailingSlash.js";
import TraverseError from "../TraverseError.js";
import isPacked from "../utilities/isPacked.js";
import isUnpackable from "../utilities/isUnpackable.js";
import from from "./from.js";
import isMaplike from "./isMaplike.js";

/**
 * Return the value at the corresponding path of keys. Throw if any interior
 * step of the path doesn't lead to a result.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param  {...any} keys
 * @returns {Promise<any>}
 */
export default async function traverseOrThrow(maplike, ...keys) {
  let value = maplike;

  // For error reporting
  let lastValue = value;
  let position = 0;

  // Process all the keys.
  const remainingKeys = keys.slice();
  let key;
  while (remainingKeys.length > 0) {
    if (value == null) {
      throw new TraverseError("A path hit a null or undefined value.", {
        head: maplike,
        lastValue,
        keys,
        position,
      });
    }

    lastValue = value;

    // If the value is packed and can be unpacked, unpack it.
    if (isPacked(value)) {
      if (typeof (/** @type {any} */ (value).unpack) === "function") {
        value = await value.unpack();
      } else {
        throw new TraverseError(
          "A path hit binary file data that can't be unpacked.",
          {
            head: maplike,
            lastValue,
            keys,
            position,
          },
        );
      }
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
      // Cast value to a map.
      const map = from(value);
      // Get the next key.
      key = remainingKeys.shift();
      // Remove trailing slash if not supported
      const normalized = /** @type {any} */ (map).trailingSlashKeys
        ? key
        : trailingSlash.remove(key);
      // Get the value for the key.
      value = await map.get(normalized);
    }

    position++;
  }

  // If last key ended in a slash and value is unpackable, unpack it.
  if (key && trailingSlash.has(key) && !isMaplike(value)) {
    if (isUnpackable(value)) {
      value = await value.unpack();
    } else {
      const message =
        value === undefined
          ? "A path tried to unpack a value that doesn't exist."
          : "A path tried to unpack data that's already unpacked.";
      throw new TraverseError(message, {
        head: maplike,
        lastValue,
        keys,
        position,
      });
    }
  }

  return value;
}
