/**
 * Load a file as JSON.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default function unpackJson(input) {
  return JSON.parse(String(input));
}
