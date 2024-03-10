import * as utilities from "../../common/utilities.js";

/**
 * Load a file as JSON.
 *
 * @type {import("@weborigami/language").FileUnpackFunction}
 */
export default function unpackJson(input) {
  const json = utilities.toString(input);
  if (!json) {
    throw new Error("Tried to parse something as JSON but it wasn't text.");
  }
  return JSON.parse(json);
}
