import { symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { processUnpackedContent } from "../builtins/internal.js";
import * as utilities from "../common/utilities.js";

/**
 * An Origami template document: a plain text file that contains Origami
 * expressions.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
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

    // Compile the text as an Origami template document.
    const templateDefineFn = compile.templateDocument(source);
    const templateFn = await templateDefineFn.call(parent);

    return processUnpackedContent(templateFn, parent);
  },
};
