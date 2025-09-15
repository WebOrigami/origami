import { Tree } from "../internal.js";
import deepText from "./deepText.js";

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
  const tree = Tree.from(args);
  return deepText(tree);
}
