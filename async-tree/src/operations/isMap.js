/**
 * Return true if the indicated object is a sync or async map.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {any} obj
 * @returns {obj is SyncOrAsyncMap}
 */
export default function isMap(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.get === "function" &&
    typeof obj.keys === "function"
  );
}
