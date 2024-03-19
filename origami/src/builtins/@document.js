import document from "../common/document.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} text
 * @param {any} [data]
 * @returns
 */
export default function documentBuiltin(text, data) {
  assertScopeIsDefined(this, "document");
  return document(text, data);
}
