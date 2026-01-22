import handleExtension from "../runtime/handleExtension.js";

/**
 * Fetch the resource at the given href.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {string} href
 * @param {SyncOrAsyncMap} parent
 */
export default async function fetchAndHandleExtension(href, parent) {
  const response = await fetch(href);
  if (!response.ok) {
    return undefined;
  }
  let buffer = await response.arrayBuffer();

  const mediaType = response.headers.get("Content-Type");
  if (mediaType) {
    /** @type {any} */ (buffer).mediaType = mediaType;
  }

  // Attach any loader defined for the file type.
  const url = new URL(href);
  const filename = url.pathname.split("/").pop();
  if (filename) {
    buffer = await handleExtension(buffer, filename, parent);
  }

  return buffer;
}
