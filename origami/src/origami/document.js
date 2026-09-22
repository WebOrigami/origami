import { args, isPlainObject } from "@weborigami/async-tree";
import documentObject from "../common/documentObject.js";

/**
 * @typedef {import("@weborigami/async-tree").Stringlike} Stringlike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {Stringlike|PlainObject} input
 * @param {any} [data]
 */
export default async function documentBuiltin(input, data) {
  input = isPlainObject(input)
    ? input
    : args.stringlike(input, "Origami.document");
  return documentObject(input, data);
}
documentBuiltin.unpackArgs = true;
