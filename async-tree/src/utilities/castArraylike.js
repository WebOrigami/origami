/**
 * Create an array or plain object from the given keys and values.
 *
 * If the given plain object has only integer keys, and the set of integers is
 * complete from 0 to length-1, assume the values are a result of array
 * transformations and the values are the desired result; return them as is.
 * Otherwise, create a plain object with the keys and values.
 *
 * @param {any[]} keys
 * @param {any[]} values
 */
export default function castArraylike(keys, values) {
  if (keys.length === 0) {
    // Empty keys/values means an empty object, not an empty array
    return {};
  }

  let onlyNumericKeys = true;
  const numberSeen = new Array(keys.length);
  for (const key of keys) {
    const n = Number(key);
    if (isNaN(n) || !Number.isInteger(n) || n < 0 || n >= keys.length) {
      onlyNumericKeys = false;
      break;
    } else {
      numberSeen[n] = true;
    }
  }

  // If any number from 0..length-1 is missing, we can't treat this as an array
  const allNumbersSeen = onlyNumericKeys && numberSeen.every((v) => v);
  if (allNumbersSeen) {
    return values;
  } else {
    // Return a plain object with the (key, value) pairs
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
  }
}
