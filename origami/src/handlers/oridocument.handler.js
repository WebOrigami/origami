import { ObjectTree, symbols } from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { parseYaml } from "../common/serialize.js";
import { toString } from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";
import parseFrontMatter from "./parseFrontMatter.js";

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

    // Unpack as a text document and parse front matter
    const unpacked = toString(packed);
    const parsed = parseFrontMatter(unpacked);

    // See if we can construct a URL to use in error messages
    const name = options.key;
    let url;
    if (name && parent?.url) {
      let parentHref = parent.url.href;
      if (!parentHref.endsWith("/")) {
        parentHref += "/";
      }
      url = new URL(name, parentHref);
    }

    // Determine the data (if present) and text content
    let text;
    let frontData = null;
    let frontSource = null;
    if (!parsed) {
      text = unpacked;
    } else {
      const { body, frontText, isOrigami } = parsed;
      if (isOrigami) {
        // Origami front matter
        frontSource = { name, text: frontText, url };
      } else {
        // YAML front matter
        frontData = parseYaml(frontText);
      }
      text = body;
    }

    // If input is a document, add the front matter to scope
    let extendedParent;
    if (frontData) {
      extendedParent = new ObjectTree(frontData);
      extendedParent.parent = parent;
    } else {
      extendedParent = parent ?? null;
    }

    // Construct an object to represent the source code
    const bodySource = { name, text, url };

    // Compile the source as an Origami template document
    const scopeCaching = frontSource ? false : true;
    const templateDefineFn = compile.templateDocument(bodySource, {
      scopeCaching,
    });

    // Determine the result of the template
    let result;
    if (frontSource) {
      // Result is the evaluated front source
      const frontFn = compile.expression(frontSource, {
        macros: {
          "@template": templateDefineFn.code,
        },
      });
      result = await frontFn.call(extendedParent);
    } else {
      const templateFn = await templateDefineFn.call(extendedParent);
      if (frontData) {
        // Result is a function that adds the front data to the template result
        result = async (input) => {
          const text = await templateFn(input);
          const object = {
            ...frontData,
            "@text": text,
          };
          object[symbols.parent] = extendedParent;
          return object;
        };
      } else {
        // Result is the body template function
        result = templateFn;
      }
    }

    return processUnpackedContent(result, parent);
  },
};
