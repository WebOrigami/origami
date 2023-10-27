/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { Scope } from "@graphorigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import TextDocument from "../../common/TextDocument.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import builtins from "../@builtins.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
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
