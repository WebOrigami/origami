/**
 * Load a file as JSON.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default function unpackJson(input) {
  return JSON.parse(String(input));
}
