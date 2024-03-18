import { Scope, compile, symbols } from "@weborigami/language";
import processUnpackedContent from "../common/processUnpackedContent.js";
import * as utilities from "../common/utilities.js";
import builtins from "./@builtins.js";

/**
 * An Origami expression file
 *
 * Unpacking an Origami file returns the result of evaluating the expression.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const attachedData = options.attachedData;
    const parent =
      options.parent ??
      /** @type {any} */ (packed).parent ??
      /** @type {any} */ (packed)[symbols.parent];

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
      text: utilities.toString(packed),
      name: options.key,
      url,
    };

    // Compile the source code as an Origami expression and evaluate it.
    const compiler = options.compiler ?? compile.expression;
    const fn = compiler(source);
    const parentScope = parent ? Scope.getScope(parent) : builtins;
    let content = await fn.call(parentScope);

    return processUnpackedContent(content, parent, attachedData);
  },
};
