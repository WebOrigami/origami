/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import isUnpackable from "../utilities/isUnpackable.js";
import toPlainValue from "../utilities/toPlainValue.js";
import from from "./from.js";

/**
 * Render the given tree in JSON format.
 *
 * @param {import("../../index.ts").Maplike} [maplike]
 */
export default async function json(maplike) {
  let tree = from(maplike);
  if (tree === undefined) {
    return undefined;
  }
  if (isUnpackable(tree)) {
    tree = await tree.unpack();
  }
  const value = await toPlainValue(tree);
  return JSON.stringify(value, null, 2);
}
