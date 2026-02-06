import { args, toString } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";

/**
 * Escapes HTML entities in a string.
 *
 * @param {import("@weborigami/async-tree").Stringlike} html
 */
export default async function htmlEscape(html) {
  const text = args.stringlike(html, "Origami.htmlEscape");
  const { JSDOM } = await loadJsDom();
  const div = JSDOM.fragment("<div></div>").firstChild;
  div.textContent = toString(text);
  return div.innerHTML;
}
