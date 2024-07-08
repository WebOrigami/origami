import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Unpack a packed format like a Uint8Array or ArrayBuffer to a usable form like
 * text or a plain JavaScript object.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {any} obj
 */
export default function unpack(obj) {
  assertTreeIsDefined(this, "unpack");
  return obj?.unpack?.();
}
