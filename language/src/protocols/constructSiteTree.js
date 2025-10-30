import { trailingSlash } from "@weborigami/async-tree";
import HandleExtensionsTransform from "../runtime/HandleExtensionsTransform.js";
import constructHref from "./constructHref.js";

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {string} protocol
 * @param {import("../../index.ts").Constructor<SyncOrAsyncMap>} mapClass
 * @param {string} host
 * @param  {string[]} keys
 */
export default function constructSiteTree(protocol, mapClass, host, ...keys) {
  // If the last key doesn't end in a slash, remove it for now.
  let lastKey;
  if (keys.length > 0 && keys.at(-1) && !trailingSlash.has(keys.at(-1))) {
    lastKey = keys.pop();
  }

  const href = constructHref(protocol, host, ...keys);
  let result = new (HandleExtensionsTransform(mapClass))(href);

  return lastKey ? result.get(lastKey) : result;
}
