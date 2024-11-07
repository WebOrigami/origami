import documentObject from "../common/documentObject.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} text
 * @param {any} [data]
 */
export default async function documentBuiltin(text, data) {
  assertTreeIsDefined(this, "text:document");
  return documentObject(text, data);
}
documentBuiltin.description =
  "document(text, [data]) - Create a document object with the text and data";
