import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";
import domNodeToObject from "./domNodeToObject.js";

/**
 * Return the DOM for the given HTML string.
 *
 * @param {import("@weborigami/async-tree").Stringlike} html
 */
export default async function htmlDom(html) {
  html = args.stringlike(html, "Origami.htmlDom");
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
