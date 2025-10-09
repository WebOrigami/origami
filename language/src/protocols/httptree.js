import { SiteTree } from "@weborigami/async-tree";
import constructSiteTree from "./constructSiteTree.js";

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
  return constructSiteTree("http:", SiteTree, host, ...keys);
}
