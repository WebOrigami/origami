import * as args from "../utilities/args.js";
import isMap from "./isMap.js";
/**
 * Calls callbackFn once for each key-value pair present in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} callbackFn
 * @param {{ deep?: boolean }} [options]
 */
export default async function forEach(maplike, callbackFn, options = {}) {
  const { deep } = await args.options(options, "Tree.forEach", {
    deep: { required: false, type: "boolean" },
  });
  const map = await args.map(maplike, "Tree.forEach", { deep: deep ?? true });
  const fn = args.fn(callbackFn, "Tree.forEach");

  for await (const key of map.keys()) {
    const value = await map.get(key);
    if (isMap(value) && options?.deep) {
      await forEach(value, fn, options);
    } else {
      await fn(value, key, map);
    }
  }
}
