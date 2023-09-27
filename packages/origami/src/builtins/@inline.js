import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/ori.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);
  const template = await loadOrigamiTemplate.call(this, input);
  return template.call(this, input);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
