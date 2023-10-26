/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { Tree } from "@graphorigami/core";
import TextDocument from "../../common/TextDocument.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import { getScope } from "../../common/utilities.js";
import * as compile from "../../language/compile.js";
import builtins from "../@builtins.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../../index.js").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const parent = options.parent ?? /** @type {any} */ (input)?.parent ?? null;

  // Get the input body text and attached content.
  const inputDocument = TextDocument.from(input);
  const text = inputDocument.text;
  const attachedData = inputDocument.data;
  if (parent && Tree.isAsyncTree(attachedData) && !attachedData.parent) {
    attachedData.parent = parent;
  }

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  // Wrap the lambda with a function that will attach the input data to the
  // result.
  /** @this {AsyncTree|null} */
  const fn = async function attachDataToResult(templateInput) {
    const text = await lambda.call(this, templateInput);
    const data = Tree.isAsyncTree(templateInput)
      ? await Tree.plain(templateInput)
      : await templateInput?.unpack?.();
    return data ? new TextDocument(text, data, parent) : text;
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, attachedData);
}
