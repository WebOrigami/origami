import { extension, trailingSlash } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { toString } from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";
import getParent from "./getParent.js";
import JseBoundaryTree from "./JseBoundaryTree.js";

/**
 * An Origami template document: a plain text file that contains Origami
 * expressions.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);

    // Unpack as a text document
    const text = toString(packed);

    // See if we can construct a URL to use in error messages
    const key = options.key;
    let url;
    if (key && /** @type {any} */ (parent)?.url) {
      let parentHref = /** @type {any} */ (parent).url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(key, parentHref);
    }

    // Compile the text as an Origami template document
    const source = {
      name: key,
      text,
      url,
    };
    const mode = options.mode ?? "shell";
    const defineFn = compile.templateDocument(source, { mode });

    let target = parent;

    // For JSE mode, add a tree to throw an error for a failed local reference
    if (mode === "jse") {
      const fileBoundary = new JseBoundaryTree();
      fileBoundary.parent = target;
      target = fileBoundary;
    }

    // Invoke the definition to get back the template function
    const result = await defineFn.call(target);

    const resultExtension = key ? extension.extname(key) : null;
    if (resultExtension && Object.isExtensible(result)) {
      // Add sidecar function so this template can be used in a map.
      result.key = addExtension(resultExtension);
    }

    return processUnpackedContent(result, parent);
  },
};

// Return a function that adds the given extension
function addExtension(resultExtension) {
  return (sourceKey) => {
    if (sourceKey === undefined) {
      return undefined;
    }
    const normalizedKey = trailingSlash.remove(sourceKey);
    const sourceExtension = extension.extname(normalizedKey);
    const resultKey = sourceExtension
      ? extension.replace(normalizedKey, sourceExtension, resultExtension)
      : normalizedKey + resultExtension;
    return resultKey;
  };
}
