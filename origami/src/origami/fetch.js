import { args } from "@weborigami/async-tree";
import { handleExtension } from "@weborigami/language";

/**
 * Extend the JavaScript `fetch` function to implicity return an ArrayBuffer
 * with an unpack() method if the resource has a known file extension.
 */
export default async function fetchBuiltin(resource, options, state) {
  resource = args.string(resource, "Origami.fetch");
  const response = await fetch(resource, options);
  if (!response.ok) {
    return undefined;
  }

  const value = await response.arrayBuffer();

  const url = new URL(resource);
  const key = url.pathname;

  return handleExtension(value, key, state?.container);
}
fetchBuiltin.needsState = true;
