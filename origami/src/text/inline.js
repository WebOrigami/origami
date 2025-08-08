import { isUnpackable, symbols, toString } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import documentObject from "../common/documentObject.js";
import { jsedocumentHandler } from "../handlers/handlers.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @this {AsyncTree|null}
 * @param {StringLike & {_body?: StringLike}} input
 */
export default async function inline(input) {
  assertTreeIsDefined(this, "inline");

  // Get the input text and any attached front matter.
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument =
    input["@text"] !== undefined || input._body !== undefined;
  const origami = inputIsDocument
    ? input["@text"] ?? input._body
    : toString(input);
  if (origami === null) {
    return undefined;
  }

  const parent =
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input)[symbols.parent] ??
    this;

  let front;
  if (inputIsDocument) {
    // Collect all document properties except the body
    front = Object.fromEntries(
      Object.entries(input).filter(
        ([key]) => key !== "@text" && key !== "_body"
      )
    );
  } else {
    front = null;
  }

  // @ts-ignore
  let result = await jsedocumentHandler.unpack(origami, {
    front,
    parent,
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
