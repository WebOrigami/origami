import {
  extension,
  ObjectTree,
  symbols,
  trailingSlash,
} from "@weborigami/async-tree";
import { compile } from "@weborigami/language";
import { parseYaml } from "../common/serialize.js";
import { toString } from "../common/utilities.js";
import { processUnpackedContent } from "../internal.js";
import getParent from "./getParent.js";
import parseFrontMatter from "./parseFrontMatter.js";

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
    const unpacked = toString(packed);

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

    // Determine the data (if present) and text content
    let text;
    let frontData = null;
    let frontSource = null;
    let extendedParent = parent;
    const parsed = parseFrontMatter(unpacked);
    if (!parsed) {
      text = unpacked;
    } else {
      const { body, frontText, isOrigami } = parsed;
      if (isOrigami) {
        // Origami front matter
        frontSource = { name: key, text: frontText, url };
      } else {
        // YAML front matter
        frontData = parseYaml(frontText);
        if (typeof frontData !== "object") {
          throw new TypeError(`YAML or JSON front matter must be an object`);
        }
        extendedParent = new ObjectTree(frontData);
        extendedParent.parent = parent;
      }
      text = body;
    }

    // Construct an object to represent the source code
    const bodySource = { name: key, text, url };

    // Compile the source as an Origami template document
    const scopeCaching = frontSource ? false : true;
    const defineTemplateFn = compile.templateDocument(bodySource, {
      scopeCaching,
    });

    // Determine the result of the template
    let result;
    if (frontSource) {
      // Result is the evaluated front source
      const frontFn = compile.expression(frontSource, {
        macros: {
          "@template": defineTemplateFn.code,
        },
      });
      result = await frontFn.call(parent);
    } else {
      const templateFn = await defineTemplateFn.call(extendedParent);
      if (frontData) {
        // Result is a function that adds the front data to the template result
        result = async (input) => {
          const text = await templateFn.call(extendedParent, input);
          const object = {
            ...frontData,
            "@text": text,
          };
          object[symbols.parent] = extendedParent;
          return object;
        };
      } else {
        // Result is a function that calls the body template
        result = templateFn;
      }
    }

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
