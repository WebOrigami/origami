import { asyncGet } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

/**
 * Returns the keys for an async exfn.
 *
 * @param {any} exfn
 */
export async function keys(exfn) {
  const result = [];
  for await (const key of exfn) {
    result.push(key);
  }
  return result;
}

/**
 * Create a plain JavaScript object with the exfn's keys cast to strings,
 * and the given `mapFn` applied to values.
 *
 * @param {any} exfn
 * @param {any} mapFn
 */
export async function mapValues(exfn, mapFn) {
  const result = {};
  for await (const key of exfn) {
    const value = await exfn[asyncGet](key);
    // TODO: Check that value is of same constructor before traversing into it.
    result[String(key)] =
      value !== undefined && AsyncExplorable.isExplorable(value)
        ? // value is also explorable; traverse into it.
          await mapValues(value, mapFn)
        : await mapFn(value);
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
export async function plain(exfn) {
  return await mapValues(exfn, (/** @type {any} */ obj) => obj);
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
export async function structure(exfn) {
  return await mapValues(exfn, () => null);
}

/**
 * Converts an exfn into a plain JavaScript object with the same structure
 * as the original, but with all leaf values cast to strings.
 *
 * @param {any} exfn
 */
export async function strings(exfn) {
  return await mapValues(exfn, async (obj) => String(await obj));
}

/**
 * Traverse a graph.
 *
 * @param {any} exfn
 * @param {any[]} path
 * @returns {Promise<any>}
 */
export async function traverse(exfn, path) {
  // Take the first element of the path as the next key.
  const [key, ...rest] = path;
  // Get the value with that key.
  const value = await exfn[asyncGet](key);
  // TODO: Check that value is of same constructor before traversing into it.
  return value !== undefined && AsyncExplorable.isExplorable(value)
    ? // value is also explorable; traverse into it.
      await traverse(value, rest)
    : value;
}
