import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Unpack a packed format like a Buffer or ArrayBuffer to a usable form like
 * text or a plain JavaScript object.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {any} obj
 */
export default function unpack(obj) {
  assertScopeIsDefined(this, "unpack");
  return obj?.unpack?.();
}
