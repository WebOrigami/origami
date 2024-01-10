import unpackText from "../builtins/@loaders/txt.js";
import * as utilities from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import unpackOrigamiExpression from "./@loaders/ori.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);

  // Get the input text and any attached front matter.
  let inputDocument;
  if (input["@text"]) {
    inputDocument = input;
  } else if (/** @type {any} */ (input).unpack) {
    // Have the input unpack itself.
    inputDocument = await /** @type {any} */ (input).unpack();
  } else {
    // Unpack the input as a text document with possible front matter.
    inputDocument = await unpackText(input);
  }

  // Treat the input text as the body of an Origami template literal.
  const inputText = utilities.toString(inputDocument);
  const templateDocument = Object.assign({}, inputDocument, {
    "@text": `=\`${inputText}\``,
  });

  const templateFn = await unpackOrigamiExpression(templateDocument);
  const templateResult = await templateFn(inputDocument);
  return inputDocument
    ? Object.assign({}, inputDocument, { "@text": String(templateResult) })
    : templateResult;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://weborigami.org/language/@inline.html";
