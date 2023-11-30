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
  if (input.unpack) {
    input = await input.unpack();
  }
  const inputDocument = input["@text"] ? input : null;
  const templateInput = inputDocument ?? input;
  const templateFn = await unpackOrigamiTemplate(templateInput);
  const text = await templateFn(inputDocument);
  return inputDocument
    ? Object.assign({}, inputDocument, { "@text": String(text) })
    : text;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
