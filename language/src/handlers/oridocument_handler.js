import { extension, getParent } from "@weborigami/async-tree";
import * as compile from "../compiler/compile.js";
import coreGlobals from "../project/coreGlobals.js";
import getGlobalsForTree from "../project/getGlobalsForTree.js";
import addExtensionKeyFn from "./addExtensionKeyFn.js";
import getSource from "./getSource.js";
import processOrigamiExport from "./processOrigamiExport.js";

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
    const fn = compile.templateDocument(source, {
      front: options.front,
      globals,
      mode: "program",
      parent,
    });

    // Invoke the definition to get back the template function or object
    let result = await fn();

    result = processOrigamiExport(result, source, parent);

    if (result instanceof Function) {
      const key = options.key;
      const resultExtension = key ? extension.extname(key) : null;
      if (resultExtension && Object.isExtensible(result)) {
        // Add sidecar function so this template can be used in a map.
        result.key = addExtensionKeyFn(resultExtension);
      }
    }

    return result;
  },
};
