import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} text
 * @param {any} [data]
 * @param {AsyncTree|null} [parent]
 * @returns
 */
export default function document(text, data, parent) {
  assertScopeIsDefined(this);
  return new TextDocument(text, data, parent ?? this);
}
