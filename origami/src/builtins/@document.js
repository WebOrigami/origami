import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} text
 * @param {any} [data]
 * @param {AsyncTree|null} [parent]
 * @returns
 */
export default function document(text, data, parent) {
  assertScopeIsDefined(this);
  const merged = Object.assign({}, data, { "@text": text });
  return new TextDocument(merged, parent ?? this);
}
