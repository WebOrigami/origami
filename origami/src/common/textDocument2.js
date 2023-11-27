import { toYaml } from "./serialize.js";

/**
 * Create a new text document: a plain object with a `@text` property and a
 * `toString()` method that returns that text.
 *
 * The `input` parameter can be anything that can be converted to a string. The
 * optional `data` parameter can be any object; if the object is a plain object,
 * its properties will be copied to the new document; otherwise, that parameter
 * is ignored.
 *
 * @typedef {import("@graphorigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 * @typedef {import("@graphorigami/types").AsyncTree|null} AsyncTree
 *
 * @param {StringLike} input
 * @param {any} [data]
 * @param {AsyncTree} [parent]
 * @returns {PlainObject}
 */
export default function textDocument2(input, data, parent) {
  const document = Object.assign({}, typeof data === "object" ? data : null, {
    "@text": String(input),
  });

  // We define methods on a separate prototype so that these methods *won't* be
  // enumerated properties of the document object.
  Object.setPrototypeOf(document, {
    getParent() {
      return parent;
    },

    /**
     * Render the text and data as a document with YAML front matter.
     */
    async pack() {
      const text = this["@text"];
      const dataWithoutText = Object.assign({}, this);
      delete dataWithoutText["@text"];
      if (Object.keys(dataWithoutText).length > 0) {
        const frontMatter = (await toYaml(data)).trimEnd();
        return `---\n${frontMatter}\n---\n${text}`;
      } else {
        return text;
      }
    },

    toString() {
      return this["@text"];
    },
  });

  return document;
}
