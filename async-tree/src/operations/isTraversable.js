import isPacked from "../utilities/isPacked.js";
import isMaplike from "./isMaplike.js";

/**
 * Return true if the object can be traversed via the `traverse()` method. The
 * object must be either maplike or a packed object with an `unpack()` method.
 *
 * @param {any} object
 */
export default function isTraversable(object) {
  return (
    isMaplike(object) ||
    (isPacked(object) && /** @type {any} */ (object).unpack instanceof Function)
  );
}
