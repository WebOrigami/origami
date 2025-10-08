import { handleExtension } from "@weborigami/language";

/**
 * @this {import("@weborigami/types").AsyncTree|null|undefined}
 */
export default async function fetchBuiltin(resource, options) {
  const response = await fetch(resource, options);
  if (!response.ok) {
    return undefined;
  }

  const value = await response.arrayBuffer();
  if (!this) {
    // Can't get extension handlers
    return value;
  }

  const url = new URL(resource);
  const key = url.pathname;
  return handleExtension(this, value, key);
}
