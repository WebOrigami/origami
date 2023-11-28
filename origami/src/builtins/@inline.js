import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import unpackOrigamiTemplate from "./@loaders/orit.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);
  const templateFn = await unpackOrigamiTemplate(input);
  const text = await templateFn(input);
  return new TextDocument(text, input);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
