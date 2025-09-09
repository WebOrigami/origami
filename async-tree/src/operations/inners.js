import { Tree } from "../internal.js";
import * as trailingSlash from "../trailingSlash.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Return the interior nodes of the tree. This relies on subtree keys having
 * trailing slashes.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default function inners(treelike) {
  assertIsTreelike(treelike, "inners");
  const tree = Tree.from(treelike);

  return {
    async get(key) {
      const value = await tree.get(key);
      return Tree.isAsyncTree(value) ? inners(value) : undefined;
    },

    async keys() {
      const keys = [...(await tree.keys())];
      const subtreeKeys = keys.filter(trailingSlash.has);
      return subtreeKeys;
    },
  };
}
