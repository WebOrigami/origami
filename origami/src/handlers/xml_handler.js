import { symbols, toString } from "@weborigami/async-tree";
import xmlDom from "../origami/xmlDom.js";

export default {
  mediaType: "application/xml",

  async unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = toString(packed);
    if (text === null) {
      throw new TypeError("XML handler can only unpack text.");
    }
    const data = await xmlDom(text);
    // Define `parent` as non-enumerable property
    Object.defineProperty(data, symbols.parent, {
      configurable: true,
      enumerable: false,
      value: parent,
      writable: true,
    });
    return data;
  },
};
