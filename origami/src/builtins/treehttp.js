import { SiteTree } from "@weborigami/async-tree";
import constructSiteTree from "../common/constructSiteTree.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return a website tree via HTTP.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default function treehttp(host, ...keys) {
  assertTreeIsDefined(this, "treehttp:");
  return constructSiteTree("http:", SiteTree, this, host, ...keys);
}

treehttp.description = "URL protocol for a website tree via HTTP";
