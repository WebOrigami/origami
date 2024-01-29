import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import getTreeArgument from "../../misc/getTreeArgument.js";

/**
 * Return only the defined (not `undefined`) values in the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function defineds(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);

  /** @type {AsyncTree} */
  let result = await Tree.mapReduce(tree, null, async (values, keys) => {
    const result = {};
    let someValuesExist = false;
    for (let i = 0; i < keys.length; i++) {
      const value = values[i];
      if (value != null) {
        someValuesExist = true;
        result[keys[i]] = values[i];
      }
    }
    return someValuesExist ? result : null;
  });

  result = Scope.treeWithScope(result, this);
  return result;
}
