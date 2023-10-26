/**
 * Load a file as JSON.
 *
 * @type {import("../../..").FileUnpackFunction}
 */
export default function unpackJson(input) {
  return JSON.parse(String(input));
}
