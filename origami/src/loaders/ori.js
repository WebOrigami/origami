/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import TextDocument from "../common/TextDocument.js";
import processUnpackedContent from "../common/processUnpackedContent.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("../..").FileUnpackFunction}
 */
export default async function unpackOrigamiExpression(input, options = {}) {
  const parent = options.parent ?? null;

  // Get the input body text.
  const inputDocument = TextDocument.from(input);
  const bodyText = inputDocument.text;

  // Compile the body text as an Origami expression and evaluate it.
  const fn = compile.expression(bodyText);
  const parentScope = parent ? getScope(parent) : builtins;
  let content = await fn.call(parentScope);

  return processUnpackedContent(content, parent);
}
