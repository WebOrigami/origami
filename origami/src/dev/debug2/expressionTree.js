import { ConstantMap, isUnpackable, Tree } from "@weborigami/async-tree";
import { evaluate, getGlobalsForTree } from "@weborigami/language";
import debugTransform from "./debugTransform.js";

// So we can distinguish different trees in the debugger
let version = 0;

/**
 * Evaluate the given expression using the indicated parent path to produce a
 * resource tree, then transform that tree with debug resources and return it.
 *
 * @param {Object} options
 * @param {string} options.expression
 * @param {import("@weborigami/language").OrigamiFileMap} options.parent
 */
export default async function expressionTree(options) {
  const { expression, parent } = options;

  const globals = getGlobalsForTree(parent);

  const source = {
    text: expression,
    cachePath: "_tree",
  };

  let maplike;
  try {
    // Evaluate the expression
    maplike = await evaluate(source, { globals, mode: "shell", parent });
    if (isUnpackable(maplike)) {
      maplike = await maplike.unpack();
    }
  } catch (/** @type {any} */ error) {
    return new ConstantMap(error.message);
  }

  if (!Tree.isMaplike(maplike)) {
    return new ConstantMap(
      `Dev.debug2: expression did not evaluate to a resource tree: ${expression}`,
    );
  }

  // Add debugging resources
  const tree = debugTransform(maplike);

  /** @type {any} */ (tree).version = version++;

  return tree;
}
