import { handleExtension } from "@weborigami/language";

/**
 * Extend the JavaScript `fetch` function to implicity return an ArrayBuffer
 * with an unpack() method if the resource has a known file extension.
 */
export default async function fetchBuiltin(resource, options) {
  const response = await fetch(resource, options);
  if (!response.ok) {
    return undefined;
  }

  const value = await response.arrayBuffer();

  const url = new URL(resource);
  const key = url.pathname;
  return handleExtension(value, key);
}
