import textDocument2 from "../common/textDocument2.js";
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
  return textDocument2(text, data, parent ?? this);
}
