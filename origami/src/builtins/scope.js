import { ops } from "@weborigami/language";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} key
 */
export default async function scope(key) {
  return ops.scope.call(this, key);
}
