import { compile } from "@weborigami/language";
import builtinsProgram from "../builtinsProgram.js";
import getConfig from "../cli/getConfig.js";
import * as utilities from "../common/utilities.js";
import getParent from "./getParent.js";
import processUnpackedContent from "./processUnpackedContent.js";

/**
 * An Origami expression file
 *
 * Unpacking an Origami file returns the result of evaluating the expression.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);

    // Construct an object to represent the source code.
    const sourceName = options.key;
    let url;
    if (sourceName && /** @type {any} */ (parent)?.url) {
      let parentHref = /** @type {any} */ (parent).url.href;
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

    // Compile the source code as an Origami program and evaluate it.
    const compiler = options.compiler ?? compile.program;

    const config = getConfig(parent) ?? {};
    const globals = {
      ...(options.globals ?? builtinsProgram()),
      ...config,
    };

    // To the parse, program and JSE modes are the same
    // TODO: Rename mode to "program"
    const mode = options.mode ?? "jse";
    const fn = compiler(source, { globals, mode });

    let result = await fn.call(parent);

    return processUnpackedContent(result, parent);
  },
};
