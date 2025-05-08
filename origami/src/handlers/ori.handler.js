import { compile } from "@weborigami/language";
import * as utilities from "../common/utilities.js";
import { builtinsTree, processUnpackedContent } from "../internal.js";
import getParent from "./getParent.js";
import JseBoundaryTree from "./JseBoundaryTree.js";

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
    const mode = options.mode ?? "shell";
    const fn = compiler(source, { mode, parent });

    let target = parent ?? builtinsTree;

    // For JSE mode, add a tree to throw an error for a failed local reference
    if (mode === "jse") {
      const fileBoundary = new JseBoundaryTree();
      fileBoundary.parent = target;
      target = fileBoundary;
    }

    let content = await fn.call(target);

    return processUnpackedContent(content, parent);
  },
};
