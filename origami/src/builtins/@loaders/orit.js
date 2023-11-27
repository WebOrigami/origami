/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { Tree } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import textDocument2 from "../../common/textDocument2.js";
import builtins from "../@builtins.js";
import unpackText from "./txt.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const parent = options.parent ?? /** @type {any} */ (input)?.parent ?? null;

  // Get the input text and any attached front matter.
  const inputDocument = await unpackText(input, { parent });
  const text = String(inputDocument);

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  // Wrap the lambda with a function that will attach the input data to the
  // result.
  /** @this {AsyncTree|null} */
  const fn = async function createTemplateResult(templateInput) {
    const text = await lambda.call(this, templateInput);
    const data = Tree.isAsyncTree(templateInput)
      ? await Tree.plain(templateInput)
      : templateInput;
    const outputDocument = textDocument2(text, data);
    return outputDocument;
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, inputDocument);
}
