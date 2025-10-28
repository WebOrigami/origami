import AsyncMap from "../drivers/AsyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import keys from "./keys.js";

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

  return Object.assign(new AsyncMap(), {
    async get(key) {
      const value = await tree.get(key);
      return isAsyncTree(value) ? inners(value) : undefined;
    },

    async keys() {
      const treeKeys = await keys(tree);
      const subtreeKeys = treeKeys.filter(trailingSlash.has);
      return subtreeKeys;
    },
  });
}
