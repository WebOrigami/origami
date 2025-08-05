import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import documentObject from "../common/documentObject.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} text
 * @param {any} [data]
 */
export default async function documentBuiltin(text, data) {
  assertTreeIsDefined(this, "document");
  return documentObject(text, data);
}
