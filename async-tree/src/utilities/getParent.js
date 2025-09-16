import * as symbols from "../symbols.js";

/**
 * Return a suitable parent for the packed file.
 *
 * This is intended to be called by unpack functions.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} packed
 * @param {any} [options]
 * @returns {AsyncTree|null}
 */
export default function getParent(packed, options = {}) {
  // Prefer parent set on options
  if (options?.parent) {
    return options.parent;
  }

  // If the packed object has a `parent` property, use that. Exception: Node
  // Buffer objects have a `parent` property that we ignore.
  if (packed.parent && !(packed instanceof Buffer)) {
    return packed.parent;
  }

  // If the packed object has a parent symbol, use that.
  if (packed[symbols.parent]) {
    return packed[symbols.parent];
  }

  // Otherwise, return null.
  return null;
}
