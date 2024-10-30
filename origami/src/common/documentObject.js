import { isPlainObject, isUnpackable, toString } from "@weborigami/async-tree";
// import txtHandler from "../builtins/txt.handler.js";

/**
 * In Origami, a text document object is any object with a `@text` property and
 * a pack() method that formats that object as text with YAML front matter. This
 * function is a helper for constructing such text document objects.
 *
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {StringLike|PlainObject} input
 * @param {any} [data]
 */
export default async function documentObject(input, data) {
  let text;
  let inputData;

  if (isUnpackable(input)) {
    // Unpack the input first, might already be a document object.
    input = await input.unpack();
  }

  if (isPlainObject(input)) {
    text = input["@text"];
    inputData = input;
  } else {
    text = toString(input);
    inputData = null;
  }
  // TODO: Either restore this code, or move responsibility for packing a
  // document to HandleExtensionsTransform set().
  // const base = {
  //   pack() {
  //     return txtHandler.pack(this);
  //   },
  // };
  // const result = Object.create(base);
  const result = {};
  Object.assign(result, inputData, data, { "@text": text });
  return result;
}
