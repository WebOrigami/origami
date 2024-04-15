import { isPacked, symbols } from "@weborigami/async-tree";
import { evaluateYaml, toYaml } from "../common/serialize.js";
import * as utilities from "../common/utilities.js";

/**
 * A text file with possible front matter
 *
 * The unpacking process will parse out any YAML or JSON front matter and attach
 * it to the document as data. The first line of the text must be "---",
 * followed by a block of JSON or YAML, followed by another line of "---". Any
 * lines following will be treated as the document text.
 *
 * If there is no front matter, the document will be treated as plain text and
 * returned as a String object.
 *
 * If there is front matter, any Origami expressions in the front matter will be
 * evaluated. The result will be a plain JavaScript object with the evaluated
 * data and a `@text` property containing the document text.
 */
export default {
  mediaType: "text/plain",

  /**
   * If the input is already in some packed format, it will be returned as is.
   *
   * Otherwise, the properties of the object will be formatted as YAML. If the
   * object has a `@text` property, that will be used as the body of the text
   * document; otherwise, an empty string will be used.
   *
   * @param {any} object
   * @returns {Promise<import("@weborigami/async-tree").Packed>}
   */
  async pack(object) {
    if (isPacked(object)) {
      return object;
    } else if (!object || typeof object !== "object") {
      throw new TypeError("The input to pack must be a JavaScript object.");
    }

    const text = object["@text"] ?? "";

    /** @type {any} */
    const dataWithoutText = Object.assign({}, object);
    delete dataWithoutText["@text"];
    if (Object.keys(dataWithoutText).length > 0) {
      const frontMatter = (await toYaml(dataWithoutText)).trimEnd();
      return `---\n${frontMatter}\n---\n${text}`;
    } else {
      return text;
    }
  },

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = utilities.toString(packed);
    if (text === null) {
      throw new Error("Tried to treat something as text but it wasn't text.");
    }

    const regex =
      /^(---\r?\n(?<frontText>[\s\S]*?\r?\n?)---\r?\n)(?<body>[\s\S]*$)/;
    const match = regex.exec(text);
    let unpacked;
    if (match) {
      // Document object with front matter
      const { body, frontText } = /** @type {any} */ (match.groups);
      const frontData = await evaluateYaml(frontText, parent);
      unpacked = Object.assign({}, frontData, { "@text": body });
    } else {
      // Plain text
      unpacked = new String(text);
    }

    unpacked[symbols.parent] = parent;
    return unpacked;
  },
};
