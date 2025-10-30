import AsyncMap from "../drivers/AsyncMap.js";

/**
 * Return true if the indicated object is a sync or async map.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {any} object
 * @returns {object is Map|AsyncMap}
 */
export default function isMap(object) {
  return object instanceof Map || object instanceof AsyncMap;
}
