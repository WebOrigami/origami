import * as trailingSlash from "../trailingSlash.js";
import assertIsTreelike from "../utilities/assertIsTreelike.js";
import from from "./from.js";
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
export default function inners(treelike) {
  assertIsTreelike(treelike, "inners");
  const tree = from(treelike);

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
