import { asyncGet, asyncSet, get, set } from "@explorablegraph/symbols";
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
    const getFn = exfn[get] ? get : asyncGet;
    const value = await exfn[getFn](key);
    // TODO: Check that value is of same constructor before traversing into it.
    result[String(key)] =
      value !== undefined && value instanceof AsyncExplorable
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
  return await mapValues(exfn, (/** @type {any} */ value) => value);
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
 * Performs a depth-first traversal of the explorable.
 *
 * Note: This does not check for or prevent cycles.
 *
 * @param {*} exfn
 * @param {function} callback
 * @param {[any[]]} route
 */
export async function traversal(exfn, callback, route = []) {
  const getFn = exfn[get] ? get : asyncGet;
  for await (const key of exfn) {
    const extendedRoute = [...route, key];
    const value = await exfn[getFn](key);
    const interior = value instanceof AsyncExplorable;
    callback(extendedRoute, interior, value);
    if (interior) {
      await traversal(value, callback, extendedRoute);
    }
  }
}

export async function update(target, source) {
  const setFn = target[set] ? set : asyncSet;
  await traversal(source, async (route, interior, value) => {
    if (!interior) {
      await target[setFn](...route, value);
    }
  });
  return target;
}
