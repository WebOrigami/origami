import { ExplorableSiteTree } from "@weborigami/async-tree";
import constructSiteTree from "../common/constructSiteTree.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * A site tree with JSON Keys via HTTPS.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default function explore(host, ...keys) {
  assertTreeIsDefined(this, "explore:");
  return constructSiteTree("https:", ExplorableSiteTree, this, host, ...keys);
}

explore.description = "Treat a website with JSON keys as a tree";
