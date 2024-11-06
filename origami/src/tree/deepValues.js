import { deepValues } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function deepValuesBuiltin(treelike) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "@valuesDeep",
    true
  );
  return deepValues(tree);
}

deepValuesBuiltin.usage = `@valuesDeep <tree>\tThe in-order tree values as a flat array`;
deepValuesBuiltin.documentation =
  "https://weborigami.org/cli/builtins.html#valuesDeep";
