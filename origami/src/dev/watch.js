import { ConstantMap, getTreeArgument, Tree } from "@weborigami/async-tree";
import { formatError, moduleCache } from "@weborigami/language";

/**
 * Let a tree (e.g., of files) respond to changes.
 *
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 * @typedef {import("@weborigami/async-tree").Invocable} Invocable
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Invocable} [fn]
 * @returns {Promise<Map|AsyncMap>}
 */
export default async function watch(maplike, fn) {
  const container = await getTreeArgument(maplike, "Dev.watch");

  // Watch the indicated tree.
  /** @type {any} */ (container).watch?.();

  if (fn === undefined) {
    return container;
  }

  // The caller supplied a function to reevaluate whenever the tree changes.
  let tree = await evaluateTree(container, fn);

  // We want to return a stable reference to the tree, so we'll use a prototype
  // chain that will always point to the latest tree. We'll extend the tree's
  // prototype chain with an empty object, and use that as a handle (pointer to
  // a pointer) to the tree. This is what we'll return to the caller.
  const handle = Object.create(tree);

  // Reevaluate the function whenever the tree changes.
  /** @type {any} */ (container).addEventListener?.("change", async () => {
    const tree = await evaluateTree(container, fn);
    moduleCache.resetTimestamp();
    updateIndirectPointer(handle, tree);
  });

  return handle;
}

async function evaluateTree(parent, fn) {
  let tree;
  let message;
  let result;
  try {
    result = await fn();
  } catch (/** @type {any} */ error) {
    message = await formatError(error);
  }
  tree = result ? Tree.from(result, { parent }) : undefined;
  if (tree) {
    return tree;
  }
  if (!message) {
    message = `Warning: watch expression did not return a tree`;
  }
  console.warn(message);
  tree = new ConstantMap(message);
  return tree;
}

// Update an indirect pointer to a target.
function updateIndirectPointer(indirect, target) {
  // Clean the pointer of any named properties or symbols that have been set
  // directly on it.
  try {
    for (const key of Object.getOwnPropertyNames(indirect)) {
      delete indirect[key];
    }
    for (const key of Object.getOwnPropertySymbols(indirect)) {
      delete indirect[key];
    }
  } catch {
    // Ignore errors.
  }

  Object.setPrototypeOf(indirect, target);
}
