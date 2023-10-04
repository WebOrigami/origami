/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default function unpackJson(input) {
  return JSON.parse(String(input));
}
