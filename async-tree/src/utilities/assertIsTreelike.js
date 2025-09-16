import isTreelike from "../operations/isTreelike.js";

/**
 * If the given object isn't treelike, throw an exception.
 *
 * @param {any} object
 * @param {string} operation
 * @param {number} [position]
 */
export default function assertIsTreelike(object, operation, position = 0) {
  let message;
  if (!object) {
    message = `${operation}: The tree argument wasn't defined.`;
  } else if (object instanceof Promise) {
    // A common mistake
    message = `${operation}: The tree argument was a Promise. Did you mean to use await?`;
  } else if (!isTreelike(object)) {
    message = `${operation}: The tree argument wasn't a treelike object.`;
  }
  if (message) {
    const error = new TypeError(message);
    /** @type {any} */ (error).position = position;
    throw error;
  }
}
