import isPacked from "../utilities/isPacked.js";
import isTreelike from "./isTreelike.js";

/**
 * Return true if the object can be traversed via the `traverse()` method. The
 * object must be either treelike or a packed object with an `unpack()` method.
 *
 * @param {any} object
 */
export default function isTraversable(object) {
  return (
    isTreelike(object) ||
    (isPacked(object) && /** @type {any} */ (object).unpack instanceof Function)
  );
}
