import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function count(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "@count");
  const keys = [...(await tree.keys())];
  return keys.length;
}

count.usage = `@count <treelike>\tReturn the number of keys in the tree`;
count.documentation = "https://weborigami.org/cli/@tree.html#count";
