/**
 * Functions for working with a cached version of the Response object.
 *
 * In theory, a Response can be cached directly and cloned via the `clone()`
 * method. However, that approach can have issues. Among other things, possible
 * bugs in Node's underlying Undici HTTP client may result in garbage collection
 * triggering issues with `clone()`.
 *
 * To avoid such issues, these functions provide a way to cache and reconstruct
 * Response objects without relying on `clone()`.
 */

/**
 * @typedef {object} CachedResponse
 * @property {ArrayBuffer} body
 * @property {Record<string, string>} headers
 * @property {number} status
 * @property {string} statusText
 */

/**
 * Given a Response, return a structure that can later be copied to a
 * ServerResponse.
 *
 * @param {Response} response
 * @returns {Promise<CachedResponse>}
 */
export async function cachedFromResponse(response) {
  const body = await response.arrayBuffer();
  const headers = Object.fromEntries(response.headers.entries());
  return {
    body,
    headers,
    status: response.status,
    statusText: response.statusText,
  };
}

/**
 * Copy a cached response to a Node server response.
 *
 * @param {CachedResponse} cachedResponse
 * @param {import("node:http").ServerResponse} response
 */
export function copyToResponse(cachedResponse, response) {
  response.statusCode = cachedResponse.status;
  response.statusMessage = cachedResponse.statusText;

  for (const [key, value] of Object.entries(cachedResponse.headers)) {
    response.setHeader(key, value);
  }

  response.end(new Uint8Array(cachedResponse.body));
}
