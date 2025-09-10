import { SiteTree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import constructSiteTree from "../common/constructSiteTree.js";

/**
 * Return a website tree via HTTPS.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default function httpstree(host, ...keys) {
  assertTreeIsDefined(this, "treehttps");
  return constructSiteTree("https:", SiteTree, this, host, ...keys);
}
