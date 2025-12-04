import { ExplorableSiteMap } from "@weborigami/async-tree";
import constructSiteTree from "./constructSiteTree.js";

/**
 * A site tree with JSON Keys via HTTP.
 *
 *
 * @param {string} host
 * @param  {...string} keys
 */
export default function explorehttp(host, ...keys) {
  return constructSiteTree("http:", ExplorableSiteMap, host, ...keys);
}
