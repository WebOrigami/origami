/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import { Tree } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import * as textDocument2 from "../../common/textDocument2.js";
import builtins from "../@builtins.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const parent = options.parent ?? /** @type {any} */ (input)?.parent ?? null;

  // Get the input body text and attached content.
  const inputDocument = textDocument2.from(input);
  const text = String(inputDocument);
  if (parent && !inputDocument.parent) {
    inputDocument.parent = parent;
  }

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  // Wrap the lambda with a function that will attach the input data to the
  // result.
  /** @this {AsyncTree|null} */
  const fn = async function attachDataToResult(templateInput) {
    const text = await lambda.call(this, templateInput);
    const data = Tree.isAsyncTree(templateInput)
      ? await Tree.plain(templateInput)
      : await templateInput?.unpack?.();
    const outputDocument = textDocument2.bodyWithData(text, data);
    outputDocument.parent = parent;
    return outputDocument;
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, inputDocument);
}
