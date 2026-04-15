import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";
import domNodeToObject from "./domNodeToObject.js";

let parser;

/**
 * Return the DOM for the given XML as a plain object.
 *
 * @param {import("@weborigami/async-tree").Stringlike} xml
 */
export default async function xmlParse(xml) {
  xml = args.stringlike(xml, "Origami.xmlParse");
  const parser = await getParser();
  const dom = parser.parseFromString(xml, "application/xml");
  let object = domNodeToObject(dom);
  if (
    (object.name === "#document" || object.name === "#document-fragment") &&
    object.children.length === 1
  ) {
    object = object.children[0];
  }
  return object;
}

async function getParser() {
  if (!parser) {
    const { JSDOM } = await loadJsDom();
    const dom = new JSDOM();
    parser = new dom.window.DOMParser();
  }
  return parser;
}
