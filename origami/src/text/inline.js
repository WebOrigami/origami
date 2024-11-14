import { isUnpackable, symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import documentObject from "../common/documentObject.js";
import { toString } from "../common/utilities.js";
import { oriHandler } from "../internal.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertTreeIsDefined(this, "text:inline");

  // Get the input text and any attached front matter.
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = input["@text"] !== undefined;
  const origami = inputIsDocument ? input["@text"] : toString(input);
  if (origami === null) {
    return undefined;
  }

  const parent =
    /** @type {any} */ (input).parent ?? input[symbols.parent] ?? this;

  // If the input document is a plain object, include it in scope for the
  // evaluated expression.
  const inputData = inputIsDocument ? input : null;

  const templateFn = await oriHandler.unpack(origami, {
    attachedData: inputData,
    compiler: compile.templateDocument,
    parent,
  });
  const templateResult = await templateFn(inputData);
  return inputIsDocument
    ? documentObject(templateResult, inputData)
    : templateResult;
}
