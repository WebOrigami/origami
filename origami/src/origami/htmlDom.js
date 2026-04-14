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
  return domNodeToObject(dom);
}
