import getTreeArgument from "../../misc/getTreeArgument.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function first(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);
  for (const key of await tree.keys()) {
    // Just return first value immediately.
    const value = await tree.get(key);
    return value;
  }
  return undefined;
}

first.usage = `first <tree>\tReturns the first value in the tree.`;
first.documentation = "https://weborigami.org/cli/builtins.html#first";
