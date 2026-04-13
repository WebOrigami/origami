import {
  extension,
  getParent,
  isPlainObject,
  setParent,
  trailingSlash,
} from "@weborigami/async-tree";
import path from "node:path";
import * as compile from "../compiler/compile.js";
import coreGlobals from "../project/coreGlobals.js";
import getGlobalsForTree from "../project/getGlobalsForTree.js";
import { cachePathSymbol } from "../runtime/symbols.js";
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
    const globals =
      options.globals ?? getGlobalsForTree(parent) ?? (await coreGlobals());
    const defineFn = compile.templateDocument(source, {
      front: options.front,
      globals,
      mode: "program",
      parent,
    });

    // Invoke the definition to get back the template function or object
    const result = await defineFn();

    if (result instanceof Function) {
      const key = options.key;
      const resultExtension = key ? extension.extname(key) : null;
      if (resultExtension && Object.isExtensible(result)) {
        // Add sidecar function so this template can be used in a map.
        result.key = addExtension(resultExtension);
      }
    } else if (parent) {
      setParent(result, parent);
      const parentCachePath = /** @type {any} */ (parent).cachePath;
      if (isPlainObject(result) && parentCachePath && options.key) {
        Object.defineProperty(result, cachePathSymbol, {
          value: path.join(parentCachePath, options.key),
          enumerable: false,
          configurable: true,
        });
      }
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
