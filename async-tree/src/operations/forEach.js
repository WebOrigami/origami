import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Calls callbackFn once for each key-value pair present in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} callbackFn
 */
export default async function forEach(maplike, callbackFn) {
  const map = await getMapArgument(maplike, "Tree.forEach");
  for await (const key of map.keys()) {
    const value = await map.get(key);
    await callbackFn(value, key, map);
  }
}
