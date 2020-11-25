import { get } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";

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
      value !== undefined && Explorable.isExplorable(value)
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
