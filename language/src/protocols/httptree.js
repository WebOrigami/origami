import { SiteMap } from "@weborigami/async-tree";
import constructSiteTree from "./constructSiteTree.js";

/**
 * Return a website tree via HTTP.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {string} host
 * @param  {...string} keys
 */
export default function httptree(host, ...keys) {
  return constructSiteTree("http:", SiteMap, host, ...keys);
}
