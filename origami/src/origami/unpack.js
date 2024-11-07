import helpRegistry from "../common/helpRegistry.js";
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
  assertTreeIsDefined(this, "origami:unpack");
  return obj?.unpack?.() ?? obj;
}

helpRegistry.set(
  "origami:unpack",
  "(buffer) - Unpack the buffer into a usable form"
);
