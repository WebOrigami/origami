import {
  isPacked,
  symbols,
  toPlainValue,
  toString,
} from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";
import parseFrontMatter from "./parseFrontMatter.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

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
 * data and a `_body` property containing the document text.
 */
export default {
  mediaType: "text/plain",

  /**
   * If the input is already in some packed format, it will be returned as is.
   *
   * Otherwise, the properties of the object will be formatted as YAML. If the
   * object has a `_body` property, that will be used as the body of the text
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

    const isDocument = object._body !== undefined;
    const text = isDocument ? object._body : toString(object);

    /** @type {any} */
    const dataWithoutText = Object.assign({}, object);
    delete dataWithoutText._body;
    if (Object.keys(dataWithoutText).length > 0) {
      const serializable = await toPlainValue(dataWithoutText);
      const yamlText = YAML.stringify(serializable);
      const frontMatter = yamlText.trimEnd();
      return `---\n${frontMatter}\n---\n${text}`;
    } else {
      return text;
    }
  },

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = toString(packed);
    if (text === null) {
      throw new Error("Tried to treat a file as text but it wasn't text.");
    }

    const parsed = parseFrontMatter(text);
    let unpacked;
    if (parsed) {
      // Document object with front matter
      const { body, frontText, isOrigami } = parsed;
      let frontData;
      if (isOrigami) {
        const globals = await projectGlobals();
        const compiled = compile.expression(frontText.trim(), {
          globals,
          parent,
        });
        frontData = await compiled();
      } else {
        frontData = YAML.parse(frontText);
      }
      unpacked = { ...frontData };
      Object.defineProperty(unpacked, "_body", {
        configurable: true,
        enumerable: true,
        value: body,
        writable: true,
      });
    } else {
      // Plain text
      unpacked = new String(text);
    }

    unpacked[symbols.parent] = parent;

    return unpacked;
  },
};
