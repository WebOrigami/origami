import * as utilities from "../common/utilities.js";

/**
 * A JSON file
 *
 * Unpacking a JSON file returns the parsed data.
 */
export default {
  mediaType: "application/json",

  /** @type {import("@weborigami/language").FileUnpackFunction} */
  unpack(input) {
    const json = utilities.toString(input);
    if (!json) {
      throw new Error("Tried to parse something as JSON but it wasn't text.");
    }
    return JSON.parse(json);
  },
};
