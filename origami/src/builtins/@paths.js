import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return an array of paths to the values in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {string} [prefix]
 */
export default async function paths(treelike, prefix = "") {
  const tree = await getTreeArgument(this, arguments, treelike);
  const result = [];
  for (const key of await tree.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await tree.get(key);
    if (await Tree.isAsyncTree(value)) {
      const subPaths = await paths.call(this, value, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `@paths(tree)\tReturn an array of paths to the values in the tree`;
