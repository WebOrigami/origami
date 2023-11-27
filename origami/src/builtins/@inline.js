import * as textDocument2 from "../common/textDocument2.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import unpackOrigamiTemplate from "./@loaders/orit.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 *
 * @this {import("@graphorigami/types").AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);
  const inputDocument = textDocument2.from(input);
  const templateFn = await unpackOrigamiTemplate(input);
  const text = await templateFn(inputDocument);
  return textDocument2.bodyWithData(text, inputDocument);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
