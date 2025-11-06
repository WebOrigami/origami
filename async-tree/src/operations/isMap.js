import AsyncMap from "../drivers/AsyncMap.js";

/**
 * Return true if the indicated object is a Map instance or supports
 * a `Map` compatible interface.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {any} object
 * @returns {object is Map|AsyncMap}
 */
export default function isMap(object) {
  if (object instanceof Map || object instanceof AsyncMap) {
    // Known positive cases
    return true;
  }

  // Check for Map-like interface
  if (
    object &&
    object.clear instanceof Function &&
    object.delete instanceof Function &&
    object.entries instanceof Function &&
    object.forEach instanceof Function &&
    object.get instanceof Function &&
    object.has instanceof Function &&
    object.keys instanceof Function &&
    object.set instanceof Function &&
    object.values instanceof Function &&
    object.constructor.groupBy instanceof Function &&
    "size" in object &&
    (object[Symbol.iterator] instanceof Function ||
      object[Symbol.asyncIterator] instanceof Function)
  ) {
    return true;
  }

  return false;
}
