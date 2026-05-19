import {
  ConstantMap,
  isUnpackable,
  setParent,
  Tree,
} from "@weborigami/async-tree";
import {
  evaluate,
  getGlobalsForTree,
  projectRootFromPath,
} from "@weborigami/language";
import path from "node:path";
import debugTransform from "./debugTransform.js";

// So we can distinguish different trees in the debugger
let version = 0;

/**
 * Evaluate the given expression using the indicated parent path to produce a
 * resource tree, then transform that tree with debug resources and return it.
 *
 * @param {Object} options
 * @param {string} options.expression
 * @param {string} options.parentPath
 */
export default async function expressionTree(options) {
  const { expression, parentPath } = options;

  const projectRoot = await projectRootFromPath(parentPath);
  await projectRoot.watch();

  // Traverse from the project root to the indicated parent.
  const relative = path.relative(projectRoot.path, parentPath);
  const parent = await Tree.traversePath(projectRoot, relative);

  const globals = getGlobalsForTree(parent);

  const source = {
    text: expression,
    relativePath: "_expression", // so cache path will be meaningful and consistent
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

  // Set the parent so that Origami debug commands can find things in scope
  setParent(maplike, parent);

  // Add debugging resources
  const tree = debugTransform(maplike);

  /** @type {any} */ (tree).version = version++;

  return tree;
}
