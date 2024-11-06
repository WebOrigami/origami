import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} obj
 * @returns
 */
export default function pack(obj) {
  assertTreeIsDefined(this, "origami:pack");
  return obj?.pack?.();
}
