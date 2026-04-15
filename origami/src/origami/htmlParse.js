import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";
import domNodeToObject from "./domNodeToObject.js";

/**
 * Return the DOM structure for the given HTML as a plain object.
 *
 * @param {import("@weborigami/async-tree").Stringlike} html
 */
export default async function htmlParse(html) {
  html = args.stringlike(html, "Origami.htmlParse");
  const { JSDOM } = await loadJsDom();
  const dom = JSDOM.fragment(html);
  let object = domNodeToObject(dom);
  if (
    (object.name === "#document" || object.name === "#document-fragment") &&
    object.children.length === 1
  ) {
    object = object.children[0];
  }
  return object;
}
