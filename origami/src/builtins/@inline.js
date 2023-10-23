import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import unpackOrigamiTemplate from "../loaders/orit.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {import("@graphorigami/types").AsyncDictionary|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);
  const inputDocument = TextDocument.from(input);
  const templateFn = await unpackOrigamiTemplate(input);
  const text = await templateFn(inputDocument);
  return new TextDocument(text, inputDocument.data, inputDocument.parent2);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
