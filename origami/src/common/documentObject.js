import { isPlainObject, isUnpackable, toString } from "@weborigami/async-tree";
import { toYaml } from "./serialize.js";

/**
 * In Origami, a text document object is any object with a `_body` property.
 * This function is a helper for constructing such text document objects.
 *
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {Stringlike|PlainObject} input
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
    text = input._body;
    inputData = input;
  } else {
    text = toString(input);
    inputData = null;
  }

  const result = {};
  Object.assign(result, inputData, data);

  Object.defineProperty(result, "_body", {
    configurable: true,
    enumerable: true,
    value: text,
    writable: true,
  });

  Object.defineProperty(result, "pack", {
    configurable: true,
    enumerable: false,
    value: pack.bind(null, result),
  });

  Object.defineProperty(result, "toString", {
    configurable: true,
    enumerable: false,
    value: pack.bind(null, result),
  });

  return result;
}

// If the document is just a _body, return its text. Otherwise, return the body
// as a string with the other properties as YAML front matter.
async function pack(document) {
  if (Object.keys(document).length === 1 && "_body" in document) {
    return document._body;
  }
  const frontData = { ...document };
  delete frontData._body;
  const frontMatter = await toYaml(frontData);
  return `---\n${frontMatter}---\n\n${document._body}`;
}
