import { Scope } from "@weborigami/language";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} n
 */
export default async function take(treelike, n) {
  const tree = await getTreeArgument(this, arguments, treelike);

  /** @type {AsyncTree} */
  let takeTree = {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.slice(0, n);
    },

    async get(key) {
      return tree.get(key);
    },
  };

  takeTree = Scope.treeWithScope(takeTree, this);

  return takeTree;
}

take.usage = `@take tree, n\tReturn the first n items from tree`;
take.documentation = "https://weborigami.org/cli/builtins.html#take";
