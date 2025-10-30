import { SiteMap } from "@weborigami/async-tree";
import constructSiteTree from "./constructSiteTree.js";

/**
 * Return a website tree via HTTPS.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {string} host
 * @param  {...string} keys
 */
export default function httpstree(host, ...keys) {
  return constructSiteTree("https:", SiteMap, host, ...keys);
}
