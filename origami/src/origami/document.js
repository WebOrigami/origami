import { args } from "@weborigami/async-tree";
import documentObject from "../common/documentObject.js";

/**
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 *
 * @param {Stringlike} text
 * @param {any} [data]
 */
export default async function documentBuiltin(text, data) {
  text = args.stringlike(text, "Origami.document");
  return documentObject(text, data);
}
