// Helper class. We define the `toString` method on a separate prototype so that
// the method *won't* be enumerated as a property of a text document object.
class ObjectWithText extends Object {
  toString() {
    return this["@text"];
  }
}

/**
 * Create a new text document: a plain object with a `@text` property and a
 * `toString()` method that returns that text.
 *
 * The `input` parameter can be anything that can be converted to a string. The
 * optional `data` parameter can be any object; if the object is a plain object,
 * its properties will be copied to the new document; otherwise, that parameter
 * is ignored.
 *
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 * @typedef {import("@graphorigami/async-tree").PlainObject} PlainObject
 *
 * @param {StringLike} input
 * @param {any} [data]
 * @returns {PlainObject}
 */
export default function textDocument2(input, data) {
  const document = Object.assign({}, typeof data === "object" ? data : null, {
    "@text": String(input),
  });
  Object.setPrototypeOf(document, ObjectWithText.prototype);
  return document;
}
