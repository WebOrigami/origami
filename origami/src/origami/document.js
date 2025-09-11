import documentObject from "../common/documentObject.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @param {StringLike} text
 * @param {any} [data]
 */
export default async function documentBuiltin(text, data) {
  return documentObject(text, data);
}
