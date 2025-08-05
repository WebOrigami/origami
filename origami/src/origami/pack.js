import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} obj
 * @returns
 */
export default function pack(obj) {
  assertTreeIsDefined(this, "pack");
  return obj?.pack?.();
}
