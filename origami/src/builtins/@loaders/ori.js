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
export default async function unpackOrigamiExpression(input, options = {}) {
  const parent =
    options.parent ??
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input)[utilities.parentSymbol];
  const attachedData = options.attachedData ?? {};

  // Compile the body text as an Origami expression and evaluate it.
  const inputText = utilities.toString(input);
  const fn = compile.expression(inputText);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  let content = await fn.call(parentScope);

  return processUnpackedContent(content, parent, attachedData);
}
