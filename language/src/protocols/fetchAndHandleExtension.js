import { args, Tree } from "@weborigami/async-tree";
import handleExtension from "../../src/runtime/handleExtension.js";
import executionContext from "../runtime/executionContext.js";

/**
 * Extend the JavaScript `fetch` function to implicity return an ArrayBuffer
 * with an unpack() method if the resource has a known file extension or MIME
 * type.
 *
 * @param {string} href
 * @param {RequestInit} [options]
 */
export default async function fetchAndHandleExtension(href, options) {
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
  const parent = executionContext.getStore()?.parent;
  const url = new URL(href);
  if (parent) {
    const root = await Tree.root(parent);
    const globals = root.globals;
    const filename = url.pathname.split("/").pop();
    buffer = await handleExtension(buffer, filename, globals, parent);
  }

  return buffer;
}
