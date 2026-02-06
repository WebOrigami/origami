/**
 * Invoke the `pack` method of an object, if it exists.
 *
 * @param {any} obj
 */
export default function pack(obj) {
  return obj?.pack?.();
}
