/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { isUnpackable, toPlainValue } from "../utilities.js";
import from from "./from.js";

/**
 * Render the given tree in JSON format.
 *
 * @param {import("../../index.ts").Treelike} [treelike]
 */
export default async function json(treelike) {
  let tree = from(treelike);
  if (tree === undefined) {
    return undefined;
  }
  if (isUnpackable(tree)) {
    tree = await tree.unpack();
  }
  const value = await toPlainValue(tree);
  return JSON.stringify(value, null, 2);
}
