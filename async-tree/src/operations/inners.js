import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";

/**
 * Return the interior nodes of the tree. This relies on subtree keys having
 * trailing slashes.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function inners(treelike) {
  const tree = await getTreeArgument(treelike, "inners");

  return {
    async get(key) {
      const value = await tree.get(key);
      return isAsyncTree(value) ? inners(value) : undefined;
    },

    async keys() {
      const keys = [...(await tree.keys())];
      const subtreeKeys = keys.filter(trailingSlash.has);
      return subtreeKeys;
    },
  };
}
