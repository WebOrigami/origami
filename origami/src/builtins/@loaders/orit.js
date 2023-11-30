import { Scope } from "@graphorigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import TextDocument from "../../common/TextDocument.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import * as utilities from "../../common/utilities.js";
import builtins from "../@builtins.js";

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
    /** @type {any} */ (input)[utilities.parentSymbol];

  // Get the input text and any attached front matter.
  const inputDocument = await TextDocument.from(input, parent);
  const text = utilities.toString(inputDocument);

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  // Wrap the lambda with a function that will attach the input data to the
  // result.
  /** @this {AsyncTree|null} */
  const fn = async function createTemplateResult(templateInput) {
    const text = await lambda.call(this, templateInput);
    const result = new String(text);
    result.unpack = () => templateInput;
    return result;
  };
  fn.code = lambda.code;

  return processUnpackedContent(fn, parent, inputDocument);
}
