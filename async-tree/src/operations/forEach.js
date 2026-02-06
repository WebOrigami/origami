import * as args from "../utilities/args.js";

/**
 * Calls callbackFn once for each key-value pair present in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} callbackFn
 */
export default async function forEach(maplike, callbackFn) {
  const map = await args.map(maplike, "Tree.forEach");
  for await (const key of map.keys()) {
    const value = await map.get(key);
    await callbackFn(value, key, map);
  }
}
