import constructHref from "./constructHref.js";
import fetchAndHandleExtension from "./fetchAndHandleExtension.js";

/**
 * Retrieve the indicated web resource via HTTP.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {string} host
 * @param  {...string} keys
 */
export default async function http(host, ...keys) {
  const href = constructHref("http:", host, ...keys);
  return fetchAndHandleExtension(href);
}
