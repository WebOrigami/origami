/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { ops } from "@weborigami/language";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @param {any} key
 * @this {AsyncTree|null}
 */
export default async function inherited(key) {
  assertTreeIsDefined(this, "inherited");
  return ops.inherited.call(this, key);
}

inherited.usage = `@inherited <key>\tThe value of the key in the tree's inherited scope`;
inherited.documentation = "https://weborigami.org/language/@inherited.html";
