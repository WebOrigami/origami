import { isUnpackable, symbols, toString } from "@weborigami/async-tree";
import { oridocumentHandler } from "@weborigami/language/src/handlers/handlers.js";
import documentObject from "../common/documentObject.js";

/**
 * Inline any Origami expressions found inside ${...} placeholders in the input
 * text.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} input
 */
export default async function inline(input) {
  // Get the input text and any attached front matter.
  if (isUnpackable(input)) {
    input = await input.unpack();
  }
  const inputIsDocument = input._body !== undefined;
  const origami = inputIsDocument ? input._body : toString(input);
  if (origami === null) {
    return undefined;
  }

  const parent =
    /** @type {any} */ (input).parent ??
    /** @type {any} */ (input)[symbols.parent];

  let front;
  if (inputIsDocument) {
    // Collect all document properties except the body
    front = Object.fromEntries(
      Object.entries(input).filter(([key]) => key !== "_body")
    );
  } else {
    front = null;
  }

  // @ts-ignore
  let result = await oridocumentHandler.unpack(origami, {
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
