import { symbols } from "@weborigami/language";
import txtHandler from "../builtins/txt_handler.js";

/**
 * In Origami, a text document object is any object with a `@text` property and
 * a pack() method that formats that object as text with YAML front matter. This
 * function is a helper for constructing such text document objects.
 *
 * The `text` input will be coerced to a string.
 */
export default function document(text, data) {
  const result = Object.assign({}, data, { "@text": String(text) });
  result[symbols.pack] = txtHandler.pack;
  return result;
}
