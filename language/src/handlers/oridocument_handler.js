import { extension, getParent, trailingSlash } from "@weborigami/async-tree";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";
import getSource from "./getSource.js";

/**
 * An Origami template document: a plain text file that contains Origami
 * expressions.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    const source = getSource(packed, options);

    // Compile the source code as an Origami template document
    const globals = options.globals ?? (await projectGlobals());
    const defineFn = compile.templateDocument(source, {
      front: options.front,
      globals,
      mode: "program",
      parent,
    });

    // Invoke the definition to get back the template function
    const result = await defineFn();

    const key = options.key;
    const resultExtension = key ? extension.extname(key) : null;
    if (resultExtension && Object.isExtensible(result)) {
      // Add sidecar function so this template can be used in a map.
      result.key = addExtension(resultExtension);
    }

    return result;
  },
};

// Return a function that adds the given extension
function addExtension(resultExtension) {
  return (sourceValue, sourceKey) => {
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
