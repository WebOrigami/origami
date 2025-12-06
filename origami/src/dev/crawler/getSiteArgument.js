import { getTreeArgument, SiteMap } from "@weborigami/async-tree";

/**
 * Return a site: if it's a tree, return the tree; if it's a string, create a
 * tree for that URL.
 */
export default async function getSiteArgument(site, command) {
  if (typeof site === "string") {
    return new SiteMap(site);
  }
  return getTreeArgument(site, command);
}
