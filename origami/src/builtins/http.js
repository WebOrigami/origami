import constructHref from "../common/constructHref.js";
import fetchAndHandleExtension from "../common/fetchAndHandleExtension.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Retrieve the indicated web resource via HTTP.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function http(host, ...keys) {
  assertTreeIsDefined(this, "http:");
  const href = constructHref("http:", host, ...keys);
  return fetchAndHandleExtension.call(this, href);
}

http.description = "Web resources via HTTP";
