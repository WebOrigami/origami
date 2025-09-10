import { SiteTree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import constructSiteTree from "../common/constructSiteTree.js";

/**
 * Return a website tree via HTTP.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default function httptree(host, ...keys) {
  assertTreeIsDefined(this, "httptree");
  return constructSiteTree("http:", SiteTree, this, host, ...keys);
}
