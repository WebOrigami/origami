import systemCache from "../runtime/systemCache.js";
import constructHref from "./constructHref.js";
import fetchAndHandleExtension from "./fetchAndHandleExtension.js";

/**
 * Retrieve the indicated web resource via HTTPS.
 *
 *
 * @param {string} host
 * @param  {...any} keys
 */
export default async function https(host, ...keys) {
  const state = keys.pop();
  const href = constructHref("https:", host, ...keys);
  return systemCache.getOrInsertComputedAsync(href, () =>
    fetchAndHandleExtension(href, state.parent),
  );
}
https.needsState = true;
