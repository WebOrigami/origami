/**
 * Load a file as JSON.
 *
 * @type {import("../../index.js").Deserializer}
 */
export default function loadJson(container, input, key) {
  return JSON.parse(String(input));
}
