import isMap from "./isMap.js";

/**
 * Return true if the indicated object is an asynchronous mutable map.
 *
 * @param {any} object
 */
export default function isReadOnlyMap(object) {
  if (!isMap(object)) {
    return false;
  }
  // Respect readOnly if defined, otherwise assume read/write
  return "readOnly" in object ? object.readOnly : false;
}
