import { createTextDocument } from "../common/createTextDocument.js";
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
  const template = await loadOrigamiTemplate(this, input);
  const fn = await template.contents();
  const bodyText = await fn.call(this);
  return createTextDocument(bodyText, {
    parent: this ?? null,
  });
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
