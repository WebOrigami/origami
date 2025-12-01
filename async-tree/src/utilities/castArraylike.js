import * as trailingSlash from "../trailingSlash.js";

/**
 * Cast the given map to a plain object or array.
 *
 * If the given plain object has only integer keys, and the set of integers is
 * complete from 0 to length-1, assume the values are a result of array
 * transformations and the values are the desired result; return them as is.
 *
 * Otherwise, call the createFn to create an object. By default, this will
 * create a plain object from the map's entries.
 *
 * @param {Map} map
 * @param {Function} [createFn]
 */
export default function castArraylike(map, createFn = Object.fromEntries) {
  if (map.size === 0) {
    // Empty keys/values means an empty object, not an empty array
    return {};
  }

  let onlyNumericKeys = true;
  const numberSeen = new Array(map.size).fill(false);
  for (const key of map.keys()) {
    const normalized = trailingSlash.remove(key);
    const n = Number(normalized);
    if (isNaN(n) || !Number.isInteger(n) || n < 0 || n >= map.size) {
      onlyNumericKeys = false;
      break;
    } else {
      numberSeen[n] = true;
    }
  }

  // If any number from 0..length-1 is missing, we can't treat this as an array
  const allNumbersSeen = onlyNumericKeys && numberSeen.every((v) => v);
  if (allNumbersSeen) {
    return Array.from(map.values());
  } else {
    // Create a map with normalized keys, then call the createFn to build the
    // result. By default this will create a plain object from the entries.
    const normalizedMap = new Map();
    for (const [key, value] of map.entries()) {
      const normalized = trailingSlash.remove(key);
      normalizedMap.set(normalized, value);
    }
    return createFn(normalizedMap);
  }
}
