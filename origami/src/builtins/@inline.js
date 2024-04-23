import { ObjectTree, isUnpackable, symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import documentObject from "../common/documentObject.js";
import { toString } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import fileTypeOrigami from "./ori_handler.js";

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
  assertScopeIsDefined(this, "inline");

  // Get the input text and any attached front matter.
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = input["@text"] !== undefined;
  const origami = inputIsDocument ? input["@text"] : toString(input);

  let parent = input.parent ?? input[symbols.parent];
  if (!parent) {
    // Construct a temporary parent that has the right scope.
    parent = new ObjectTree({});
    parent.scope = this;
  }

  // If the input document is a plain object, include it in scope for the
  // evaluated expression.
  const inputData = inputIsDocument ? input : null;

  const templateFn = await fileTypeOrigami.unpack(origami, {
    attachedData: inputData,
    compiler: compile.templateDocument,
    parent,
  });
  const templateResult = await templateFn(inputData);
  return inputIsDocument
    ? documentObject(templateResult, inputData)
    : templateResult;
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://weborigami.org/language/@inline.html";
