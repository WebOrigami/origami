import { symbols } from "@weborigami/async-tree";
import * as utilities from "../common/utilities.js";

/**
 * A JSON file
 *
 * Unpacking a JSON file returns the parsed data.
 */
export default {
  mediaType: "application/json",

  /** @type {import("@weborigami/language").UnpackFunction} */
  unpack(packed) {
    const json = utilities.toString(packed);
    if (!json) {
      throw new Error("Tried to parse something as JSON but it wasn't text.");
    }
    const data = JSON.parse(json);
    if (data && typeof data === "object" && Object.isExtensible(data)) {
      Object.defineProperty(data, symbols.deep, {
        enumerable: false,
        value: true,
      });
    }
    return data;
  },
};
