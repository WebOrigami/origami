/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import TextDocument from "../../common/TextDocument.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import * as compile from "../../compiler/compile.js";
import Scope from "../../runtime/Scope.js";
import builtins from "../@builtins.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("../../../index.js").FileUnpackFunction}
 */
export default async function unpackOrigamiExpression(input, options = {}) {
  const parent = options.parent ?? null;

  // Get the input body text.
  const inputDocument = TextDocument.from(input);
  const bodyText = inputDocument.text;

  // Compile the body text as an Origami expression and evaluate it.
  const fn = compile.expression(bodyText);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  let content = await fn.call(parentScope);

  return processUnpackedContent(content, parent);
}
