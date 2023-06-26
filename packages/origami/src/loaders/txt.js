/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */

/**
 * Load a file as plain text.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadText(buffer, key) {
  return String(buffer);
}
