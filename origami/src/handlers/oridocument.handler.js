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

    // Determine the data (if present) and text content
    let frontData = null;
    let extendedParent = parent;
    const parsed = parseFrontMatter(text);
    const hasFrontYaml = parsed ? !parsed.isOrigami : false;
    if (hasFrontYaml) {
      // YAML front matter
      frontData = parseYaml(parsed.frontText);
      if (typeof frontData !== "object") {
        throw new TypeError(`YAML or JSON front matter must be an object`);
      }
      extendedParent = new ObjectTree(frontData);
      extendedParent.parent = parent;
    }

    // Compile the text as an Origami template document
    const source = {
      name: key,
      text,
      url,
    };
    const defineFn = compile.templateDocument(source);

    // Invoke the definition to get back the template function
    const templateFn = await defineFn.call(extendedParent);

    // Determine the form of the result
    let result;
    if (hasFrontYaml) {
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
      // Return the resulting function itself
      result = templateFn;
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
