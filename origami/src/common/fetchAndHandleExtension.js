import { handleExtension } from "@weborigami/language";

/**
 * Fetch the resource at the given href.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} href
 */
export default async function fetchAndHandleExtension(href) {
  const response = await fetch(href);
  if (!response.ok) {
    return undefined;
  }
  let buffer = await response.arrayBuffer();

  // Attach any loader defined for the file type.
  const url = new URL(href);
  const filename = url.pathname.split("/").pop();
  if (this && filename) {
    buffer = await handleExtension(this, buffer, filename);
  }

  return buffer;
}
