import { Tree, isPlainObject } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import builtins from "../@builtins.js";
import unpackText from "./txt.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const parent =
    options.parent ??
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input).getParent?.();

  // Get the input text and any attached front matter.
  const isInputDocument = input["@text"] !== undefined;
  const inputDocument = isInputDocument
    ? input
    : await unpackText(input, { parent });
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
      : isPlainObject(templateInput)
      ? templateInput
      : null;
    return Object.assign({}, data, {
      "@text": text,
    });
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, inputDocument);
}
