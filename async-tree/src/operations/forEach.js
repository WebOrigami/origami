import * as args from "../utilities/args.js";
import isMap from "./isMap.js";
/**
 * Calls callbackFn once for each key-value pair present in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} callbackFn
 * @param {{ deep: boolean }} [options]
 */
export default async function forEach(maplike, callbackFn, options) {
  const map = await args.map(maplike, "Tree.forEach", options);
  if (typeof callbackFn !== "function") {
    throw new TypeError("Tree.forEach: Expected a function argument.");
  }

  for await (const key of map.keys()) {
    const value = await map.get(key);
    if (isMap(value) && options?.deep) {
      await forEach(value, callbackFn, options);
    } else {
      await callbackFn(value, key, map);
    }
  }
}
