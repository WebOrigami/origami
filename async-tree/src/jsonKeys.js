import { Tree } from "./internal.js";

/**
 * The JSON Keys protocol lets a site expose the keys of a node in the site so
 * that they can be read by SiteTree.
 *
 * This file format is a JSON array of key descriptors: a string like
 * "index.html" for a specific resource available at the node, or a string with
 * a trailing slash like "about/" for a subtree of that node.
 */

/**
 * Parse the JSON in a .keys.json file.
 *
 * This returns a flat dictionary of flags which are true for subtrees and
 * false otherwise.
 *
 * Example: the JSON `["index.html","about/"]` parses as:
 *
 *   {
 *     "index.html": false,
 *     about: true,
 *   }
 */
export function parse(json) {
  const descriptors = JSON.parse(json);
  const result = {};
  for (const descriptor of descriptors) {
    if (descriptor.endsWith("/")) {
      result[descriptor.slice(0, -1)] = true;
    } else {
      result[descriptor] = false;
    }
  }
  return result;
}

/**
 * Given a tree node, return a JSON string that can be written to a .keys.json
 * file.
 */
export async function stringify(treelike) {
  const tree = Tree.from(treelike);
  let keys = Array.from(await tree.keys());
  // Skip the key `.keys.json` if present.
  keys = keys.filter((key) => key !== ".keys.json");
  const json = JSON.stringify(keys);
  return json;
}
