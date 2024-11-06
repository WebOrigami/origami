import { trailingSlash, Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the interior nodes of the tree. This relies on subtree keys having
 * trailing slashes.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function inners(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "@inners");

  const result = {
    async get(key) {
      const value = await tree.get(key);
      return Tree.isAsyncTree(value) ? inners.call(this, value) : undefined;
    },

    async keys() {
      const keys = [...(await tree.keys())];
      const subtreeKeys = keys.filter(trailingSlash.has);
      return subtreeKeys;
    },
  };

  return result;
}

inners.usage = `@inners <tree>\tThe interior nodes of the tree`;
inners.documentation = "https://weborigami.org/cli/builtins.html#inners";
