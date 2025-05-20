import {
  isUnpackable,
  ObjectTree,
  symbols,
  toString,
} from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import documentObject from "../common/documentObject.js";
import { oridocumentHandler } from "../handlers/handlers.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertTreeIsDefined(this, "text:inline");

  // Get the input text and any attached front matter.
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = input["@text"] !== undefined;
  const origami = inputIsDocument ? input["@text"] : toString(input);
  if (origami === null) {
    return undefined;
  }

  const parent =
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input)[symbols.parent] ??
    this;

  let extendedParent = parent;
  if (inputIsDocument) {
    extendedParent = new ObjectTree(input);
    extendedParent.parent = parent;
  }

  // @ts-ignore
  let result = await oridocumentHandler.unpack(input, {
    parent: extendedParent,
  });

  if (result instanceof Function) {
    const text = await result();
    if (inputIsDocument) {
      return documentObject(text, input);
    } else {
      return text;
    }
  }

  return result;
}
