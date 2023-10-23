import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {StringLike} text
 * @param {any} [data]
 * @param {AsyncDictionary|null} [parent]
 * @returns
 */
export default function document(text, data, parent) {
  assertScopeIsDefined(this);
  if (data) {
    return new TextDocument(text, data, parent ?? this);
  } else {
    const document = TextDocument.from(text);
    document.parent2 = parent;
    return document;
  }
}
