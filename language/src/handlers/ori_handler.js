import { getParent, setParent } from "@weborigami/async-tree";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";
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
    const globals = options.globals ?? (await projectGlobals());
    const fn = compiler(source, {
      globals,
      mode: "program",
      parent,
    });

    // Evaluate the program
    const result = await fn();

    if (parent) {
      setParent(result, parent);
    }

    return result;
  },
};
