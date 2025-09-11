/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} obj
 */
export default function pack(obj) {
  return obj?.pack?.();
}
