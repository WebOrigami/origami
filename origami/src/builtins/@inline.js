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
  const inputDocument = (await /** @type {any} */ (input).unpack?.()) ?? input;
  const templateFn = await unpackOrigamiTemplate(inputDocument);
  const text = await templateFn(inputDocument);
  return new TextDocument(text, inputDocument);
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
