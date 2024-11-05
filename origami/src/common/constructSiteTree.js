import { trailingSlash } from "@weborigami/async-tree";
import { HandleExtensionsTransform } from "@weborigami/language";
import constructHref from "./constructHref.js";

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {string} protocol
 * @param {import("../../index.ts").Constructor<AsyncTree>} treeClass
 * @param {AsyncTree|null} parent
 * @param {string} host
 * @param  {string[]} keys
 */
export default function constructSiteTree(
  protocol,
  treeClass,
  parent,
  host,
  ...keys
) {
  // If the last key doesn't end in a slash, remove it for now.
  let lastKey;
  if (keys.length > 0 && keys.at(-1) && !trailingSlash.has(keys.at(-1))) {
    lastKey = keys.pop();
  }

  const href = constructHref(protocol, host, ...keys);
  let result = new (HandleExtensionsTransform(treeClass))(href);
  result.parent = parent;

  return lastKey ? result.get(lastKey) : result;
}
