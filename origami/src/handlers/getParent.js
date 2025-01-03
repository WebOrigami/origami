import { symbols } from "@weborigami/async-tree";

/**
 * Return a suitable parent for the packed file.
 *
 * @param {any} packed
 * @param {any} options
 * @returns {import("@weborigami/types").AsyncTree|null}
 */
export default function getParent(packed, options) {
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
