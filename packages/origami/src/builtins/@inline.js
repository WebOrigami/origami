import TextDocument2 from "../common/TextDocument2.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/orit.js";

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
  const inputDocument = TextDocument2.from(input);
  const templateFn = await loadOrigamiTemplate(this, input);
  const text = await templateFn.call(this);
  return new TextDocument2(text, inputDocument.data, inputDocument.parent);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
