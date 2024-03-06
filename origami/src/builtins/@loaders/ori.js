import { Scope, compile, symbols } from "@weborigami/language";
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
  const attachedData = options.attachedData;
  const parent =
    options.parent ??
    /** @type {any} */ (inputDocument).parent ??
    /** @type {any} */ (inputDocument)[symbols.parent];

  // Construct an object to represent the source code.
  const sourceName = options.key;
  let url;
  if (sourceName && parent?.url) {
    let parentHref = parent.url.href;
    if (!parentHref.endsWith("/")) {
      parentHref += "/";
    }
    url = new URL(sourceName, parentHref);
  }

  const source = {
    text: utilities.toString(inputDocument),
    name: options.key,
    url,
  };

  // Compile the source code as an Origami expression and evaluate it.
  const compiler = options.compiler ?? compile.expression;
  const fn = compiler(source);
  const parentScope = parent ? Scope.getScope(parent) : builtins;
  let content = await fn.call(parentScope);

  return processUnpackedContent(content, parent, attachedData);
}
