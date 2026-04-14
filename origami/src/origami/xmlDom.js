import { args } from "@weborigami/async-tree";
import loadJsDom from "../common/loadJsDom.js";
import domNodeToObject from "./domNodeToObject.js";

let parser;

/**
 * Return the DOM for the given XML string.
 *
 * @param {import("@weborigami/async-tree").Stringlike} xml
 */
export default async function xmlDom(xml) {
  xml = args.stringlike(xml, "Origami.xmlDom");
  const parser = await getParser();
  const dom = parser.parseFromString(xml, "application/xml");
  return domNodeToObject(dom);
}

async function getParser() {
  if (!parser) {
    const { JSDOM } = await loadJsDom();
    const dom = new JSDOM();
    parser = new dom.window.DOMParser();
  }
  return parser;
}
