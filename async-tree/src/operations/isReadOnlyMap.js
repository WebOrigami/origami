import AsyncMap from "../drivers/AsyncMap.js";

/**
 * Return true if the indicated object is an asynchronous mutable tree.
 *
 * @param {import("../../index.ts").SyncOrAsyncMap} object
 */
export default function isReadOnlyMap(object) {
  return object instanceof AsyncMap && object.readOnly;
}
