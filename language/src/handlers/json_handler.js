import { symbols, toString } from "@weborigami/async-tree";

/**
 * A JSON file
 *
 * Unpacking a JSON file returns the parsed data.
 */
export default {
  mediaType: "application/json",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  unpack(packed) {
    const json = toString(packed);
    if (!json) {
      throw new Error("JSON handler can only unpack text.");
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
