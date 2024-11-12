import constructHref from "../common/constructHref.js";
import fetchAndHandleExtension from "../common/fetchAndHandleExtension.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Retrieve the indicated web resource via HTTPS.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function https(host, ...keys) {
  assertTreeIsDefined(this, "https:");
  const href = constructHref("https:", host, ...keys);
  return fetchAndHandleExtension.call(this, href);
}
