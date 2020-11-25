import { get } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";
import ExplorableMap from "./ExplorableMap.js";

/**
 * Returns the keys for an exfn.
 *
 * @param {any} exfn
 */
export function keys(exfn) {
  return [...exfn];
}

/**
 * Create a ExplorableMap with the exfn's keys cast to mapped using the given
 * mapFn.
 *
 * @param {any} exfn
 * @param {any} mapFn
 */
export function mapKeys(exfn, mapFn) {
  const map = new Map();
  for (const key of exfn) {
    const value = exfn[get](key);
    const mappedKey = mapFn(key);
    // TODO: Check that value is of same constructor before traversing into it.
    const mappedValues =
      value !== undefined && value instanceof Explorable
        ? // value is also explorable; traverse into it.
          mapKeys(value, mapFn)
        : value;
    map.add(mappedKey, mappedValue);
  }
  return new ExplorableMap(map);
}

/**
 * Create a plain JavaScript object with the exfn's keys cast to strings,
 * and the given `mapFn` applied to values.
 *
 * @param {any} exfn
 * @param {any} mapFn
 */
export function mapValues(exfn, mapFn) {
  const result = {};
  for (const key of exfn) {
    const value = exfn[get](key);
    // TODO: Check that value is of same constructor before traversing into it.
    result[String(key)] =
      value !== undefined && value instanceof Explorable
        ? // value is also explorable; traverse into it.
          mapValues(value, mapFn)
        : mapFn(value);
  }
  return result;
}

/**
 * Converts an exfn into a plain JavaScript object.
 *
 * The result's keys will be the exfn's keys cast to strings. Any exfn value
 * that is itself an exfn will be similarly converted to a plain object.
 *
 * @param {any} exfn
 */
export function plain(exfn) {
  return mapValues(exfn, (/** @type {any} */ value) => value);
}

/**
 * Converts an exfn into a plain JavaScript object with the same structure
 * as the original, but with all leaf values cast to strings.
 *
 * @param {any} exfn
 */
export function strings(exfn) {
  return mapValues(exfn, (obj) => String(obj));
}

/**
 * Converts an exfn into a plain JavaScript object with the same structure
 * as the original, but with all leaf values being `null`.
 *
 * The result's keys will be the exfn's keys cast to strings. Any exfn value
 * that is itself an exfn will be similarly converted to its structure.
 *
 * @param {any} exfn
 */
export function structure(exfn) {
  return mapValues(exfn, () => null);
}

/**
 * Traverse a graph.
 *
 * @param {any} exfn
 * @param {any[]} path
 * @returns {Promise<any>}
 */
export function traverse(exfn, path) {
  // Take the first element of the path as the next key.
  const [key, ...rest] = path;
  // Get the value with that key.
  const value = exfn[get](key);
  // TODO: Check that value is of same constructor before traversing into it.
  return value !== undefined && value instanceof Explorable
    ? // value is also explorable; traverse into it.
      traverse(value, rest)
    : value;
}
