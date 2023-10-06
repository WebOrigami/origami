/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import TextDocument from "../common/TextDocument.js";
import { processUnpackedContent } from "../common/processUnpackedContent.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../..").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const parent = options.parent ?? /** @type {any} */ (input)?.parent ?? null;

  // Get the input body text and attached content.
  const inputDocument = TextDocument.from(input);
  const text = inputDocument.text;
  const attachedData = await inputDocument.data;

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  return processUnpackedContent(lambda, parent, attachedData);
}
