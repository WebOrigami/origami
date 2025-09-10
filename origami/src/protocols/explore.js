import { ExplorableSiteTree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import constructSiteTree from "../common/constructSiteTree.js";

/**
 * A site tree with JSON Keys via HTTPS.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default function explore(host, ...keys) {
  assertTreeIsDefined(this, "explore");
  return constructSiteTree("https:", ExplorableSiteTree, this, host, ...keys);
}
