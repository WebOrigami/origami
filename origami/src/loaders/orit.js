/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Tree } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import TextDocument from "../common/TextDocument.js";
import processUnpackedContent from "../common/processUnpackedContent.js";
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
  const attachedData = inputDocument.data;
  if (parent && Tree.isAsyncTree(attachedData)) {
    attachedData.parent = parent;
  }

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  // Wrap the lambda with a function that will attach the input data to the
  // result.
  /** @this {AsyncDictionary|null} */
  const fn = async function attachDataToResult(templateInput) {
    const text = await lambda.call(this, templateInput);
    const data = Tree.isAsyncDictionary(templateInput)
      ? await Tree.plain(templateInput)
      : await templateInput?.unpack?.();
    return data ? new TextDocument(text, data, parent) : text;
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, attachedData);
}
