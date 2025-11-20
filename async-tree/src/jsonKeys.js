import entries from "./operations/entries.js";
import from from "./operations/from.js";
import isMap from "./operations/isMap.js";
import keys from "./operations/keys.js";
import * as trailingSlash from "./trailingSlash.js";

/**
 * Given a tree node, return a JSON string that can be written to a .keys.json
 * file.
 *
 * The JSON Keys protocol lets a site expose the keys of a node in the site so
 * that they can be read by SiteTree.
 *
 * This file format is a JSON array of key descriptors: a string like
 * "index.html" for a specific resource available at the node, or a string with
 * a trailing slash like "about/" for a subtree of that node.
 */
export async function stringify(maplike) {
  const tree = from(maplike);

  let treeKeys;
  if (/** @type {any} */ (tree).trailingSlashKeys) {
    treeKeys = await keys(tree);
  } else {
    // Use entries() to determine which keys are subtrees.
    const treeEntries = await entries(tree);
    treeKeys = treeEntries.map(([key, value]) =>
      trailingSlash.toggle(key, isMap(value))
    );
  }

  // Skip the key `.keys.json` if present.
  treeKeys = treeKeys.filter((key) => key !== ".keys.json");
  const json = JSON.stringify(treeKeys);
  return json;
}
