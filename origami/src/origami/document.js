import documentObject from "../common/documentObject.js";

/**
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Stringlike} text
 * @param {any} [data]
 */
export default async function documentBuiltin(text, data) {
  return documentObject(text, data);
}
