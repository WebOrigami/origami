/**
 * Load a file as plain text.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadText(buffer, key) {
  return String(buffer);
}
