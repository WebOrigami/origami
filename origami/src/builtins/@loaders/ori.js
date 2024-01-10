import { Scope } from "@weborigami/language";
import * as compile from "../../../../language/src/compiler/compile.js";
import processUnpackedContent from "../../common/processUnpackedContent.js";
import * as utilities from "../../common/utilities.js";
import builtins from "../@builtins.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default async function unpackOrigamiExpression(
  inputDocument,
  options = {}
) {
  const parent =
    options.parent ??
    /** @type {any} */ (inputDocument).parent ??
    /** @type {any} */ (inputDocument)[utilities.parentSymbol];

  // Compile the body text as an Origami expression and evaluate it.
  const inputText = utilities.toString(inputDocument);
  const fn = compile.expression(inputText);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  let content = await fn.call(parentScope);

  return processUnpackedContent(content, parent, inputDocument);
}
