/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackJson(container, input, key) {
  return JSON.parse(String(input));
}
