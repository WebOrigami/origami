import {
  ConstantMap,
  isUnpackable,
  setParent,
  Tree,
} from "@weborigami/async-tree";
import { evaluate, OrigamiFileMap, projectGlobals } from "@weborigami/language";
import debugTransform from "./debugTransform.js";

// So we can distinguish different trees in the debugger
let version = 0;

/**
 * Evaluate the given expression using the indicated parent path to produce a
 * resource tree, then transform that tree with debug resources and return it.
 *
 * @param {Object} options
 * @param {string} options.debugFilesPath
 * @param {string} options.expression
 * @param {string} options.parentPath
 * @param {boolean} options.enableUnsafeEval
 */
export default async function expressionTree(options) {
  const { debugFilesPath, expression, parentPath, enableUnsafeEval } = options;

  const parent = new OrigamiFileMap(parentPath);
  const globals = await projectGlobals(parent);

  let maplike;
  try {
    // Evaluate the expression
    maplike = await evaluate(expression, { globals, mode: "shell", parent });
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

  // Set the parent so that Origami debug commands can find things in scope
  setParent(maplike, parent);

  // Add debugging resources
  const tree = debugTransform(maplike, debugFilesPath, enableUnsafeEval);

  /** @type {any} */ (tree).version = version++;

  return tree;
}
