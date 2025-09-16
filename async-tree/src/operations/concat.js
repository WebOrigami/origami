import deepText from "./deepText.js";
import from from "./from.js";

/**
 * Concatenate the text content of objects or trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any[]} args
 */
export default async function concat(...args) {
  console.warn(
    "Warning: the Tree.concat function is deprecated, use Tree.deepText instead."
  );
  const tree = from(args);
  return deepText(tree);
}
