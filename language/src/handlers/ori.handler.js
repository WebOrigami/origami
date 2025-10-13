import { getParent, toString } from "@weborigami/async-tree";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";

/**
 * An Origami expression file
 *
 * Unpacking an Origami file returns the result of evaluating the expression.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
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
      text: toString(packed),
      name: options.key,
      url,
    };

    // Compile the source code as an Origami program and evaluate it.
    const compiler = options.compiler ?? compile.program;
    const globals = options.globals ?? (await projectGlobals());

    const fn = compiler(source, {
      globals,
      mode: "program",
      parent,
    });

    let result = await fn.call(parent);

    return result;
  },
};
