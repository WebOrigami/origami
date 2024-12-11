import { ObjectTree, symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { toString } from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";
import txtHandler from "./txt.handler.js";

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

    // Unpack as a text document
    const unpacked = txtHandler.unpack(packed, options);
    const inputIsDocument = unpacked["@text"] !== undefined;
    const text = inputIsDocument ? unpacked["@text"] : toString(unpacked);

    // See if we can construct a URL to use in error messages
    const sourceName = options.key;
    let url;
    if (sourceName && parent?.url) {
      let parentHref = parent.url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(sourceName, parentHref);
    }

    // Construct an object to represent the source code
    const source = {
      text,
      name: options.key,
      url,
    };

    // If input is a document, add the front matter to scope
    let extendedParent;
    if (inputIsDocument) {
      extendedParent = new ObjectTree(unpacked);
      extendedParent.parent = parent;
    } else {
      extendedParent = parent;
    }

    // Compile the source as an Origami template document
    const templateDefineFn = compile.templateDocument(source);
    const templateFn = await templateDefineFn.call(extendedParent);

    // If the input was a document, return a function that updates
    // the document with the template result as @text. Otherwise
    // return the template result.
    const resultFn = inputIsDocument
      ? async (input) => {
          const text = await templateFn(input);
          const result = {
            ...unpacked,
            "@text": text,
          };
          result[symbols.parent] = extendedParent;
          return result;
        }
      : templateFn;

    return processUnpackedContent(resultFn, parent);
  },
};
