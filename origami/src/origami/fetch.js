import { args, Tree } from "@weborigami/async-tree";
import { handleExtension } from "@weborigami/language";

/**
 * Extend the JavaScript `fetch` function to implicity return an ArrayBuffer
 * with an unpack() method if the resource has a known file extension.
 *
 * @param {string} href
 */
export default async function fetchBuiltin(href, options, state) {
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
  const { parent } = state;
  const url = new URL(href);
  const filename = url.pathname.split("/").pop();
  if (parent) {
    const root = await Tree.root(parent);
    const globals = root.globals;
    buffer = await handleExtension(buffer, filename, globals, parent);
  }

  return buffer;
}
fetchBuiltin.needsState = true;
