import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";

let parser;

/**
 * Return the DOM for the given XML.
 *
 * @param {import("@weborigami/async-tree").Stringlike} xml
 */
export default async function xmlDom(xml) {
  xml = args.stringlike(xml, "Origami.xmlDom");
  const parser = await getParser();
  let dom = parser.parseFromString(xml, "application/xml");
  if (
    (dom.nodeType === 9 || dom.nodeType === 11) &&
    dom.children.length === 1
  ) {
    // Document or DocumentFragment with a single child: return the child
    dom = dom.children[0];
  }
  return dom;
}

async function getParser() {
  if (!parser) {
    const { JSDOM } = await loadJsDom();
    const dom = new JSDOM();
    parser = new dom.window.DOMParser();
  }
  return parser;
}
