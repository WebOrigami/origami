import { toString } from "@weborigami/async-tree";
import htmlParse from "../origami/htmlParse.js";

export default {
  mediaType: "text/html",

  unpack(packed) {
    const text = toString(packed);
    if (text === null) {
      throw new Error("HTML handler can only unpack text.");
    }
    const html = htmlParse(text);
    return html;
  },
};
