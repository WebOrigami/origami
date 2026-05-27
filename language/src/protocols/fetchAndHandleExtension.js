import { args, Tree } from "@weborigami/async-tree";
import handleExtension from "../../src/runtime/handleExtension.js";

/**
 * Extend the JavaScript `fetch` function to implicity return an ArrayBuffer
 * with an unpack() method if the resource has a known file extension or MIME
 * type.
 *
 * @param {string} href
 */
export default async function fetchAndHandleExtension(href, options, state) {
  if (options && state === undefined) {
    // Options weren't provided
    state = options;
    options = undefined;
  }

  href = args.string(href, "Origami.fetch");
  const response = await fetch(href, options);
  if (!response.ok) {
    return undefined;
  }

  let buffer = await response.arrayBuffer();

  const mediaType = response.headers.get("Content-Type");
  if (mediaType) {
    /** @type {any} */ (buffer).mediaType = mediaType;
  }

  // Attach any handler defined for the file type or MIME type.
  const parent = state?.parent;
  const url = new URL(href);
  if (parent) {
    const root = await Tree.root(parent);
    const globals = root.globals;
    const filename = url.pathname.split("/").pop();
    buffer = await handleExtension(buffer, filename, globals, parent);
  }

  return buffer;
}
fetchAndHandleExtension.needsState = true;
