import { ExplorableSiteTree } from "@weborigami/async-tree";
import constructSiteTree from "./constructSiteTree.js";

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
  return constructSiteTree("https:", ExplorableSiteTree, host, ...keys);
}
