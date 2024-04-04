import { isPlainObject } from "@weborigami/async-tree";
import txtHandler from "../builtins/txt_handler.js";

/**
 * In Origami, a text document object is any object with a `@text` property and
 * a pack() method that formats that object as text with YAML front matter. This
 * function is a helper for constructing such text document objects.
 *
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {StringLike|PlainObject} input
 * @param {PlainObject} [data]
 */
export default function documentObject(input, data) {
  let text;
  let inputData;
  if (isPlainObject(input)) {
    text = input["@text"];
    inputData = input;
  } else {
    text = String(input);
    inputData = null;
  }
  const base = {
    pack() {
      return txtHandler.pack(this);
    },
  };
  const result = Object.create(base);
  Object.assign(result, inputData, data, { "@text": text });
  return result;
}
