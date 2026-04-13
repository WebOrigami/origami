import { getParent, isPlainObject, setParent } from "@weborigami/async-tree";
import path from "node:path";
import * as compile from "../compiler/compile.js";
import coreGlobals from "../project/coreGlobals.js";
import getGlobalsForTree from "../project/getGlobalsForTree.js";
import { cachePathSymbol } from "../runtime/symbols.js";
import getSource from "./getSource.js";

/**
 * An Origami expression file
 *
 * Unpacking an Origami file returns the result of evaluating the expression.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    const source = getSource(packed, options);

    // Compile the source code as an Origami program
    const compiler = options.compiler ?? compile.program;
    const globals =
      options.globals ?? getGlobalsForTree(parent) ?? (await coreGlobals());
    const fn = compiler(source, {
      globals,
      mode: "program",
      parent,
    });

    // Evaluate the program
    const result = await fn();

    if (parent) {
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
