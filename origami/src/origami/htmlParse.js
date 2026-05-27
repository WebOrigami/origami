import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";

/**
 * Return the DOM structure for the given HTML.
 *
 * @param {import("@weborigami/async-tree").Stringlike} html
 */
export default async function htmlParse(html) {
  html = args.stringlike(html, "Origami.htmlParse");
  const { JSDOM } = await loadJsDom();
  let dom = JSDOM.fragment(html);
  if (
    (dom.nodeType === 9 || dom.nodeType === 11) &&
    dom.children.length === 1
  ) {
    // Document or DocumentFragment with a single child: return the child
    dom = dom.children[0];
  }
  return dom;
}
