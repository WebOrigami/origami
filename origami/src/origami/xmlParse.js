import { args } from "@weborigami/async-tree";
import xmlDom from "./xmlDom.js";

/**
 * Return the DOM structure for the given XML.
 *
 * @param {import("@weborigami/async-tree").Stringlike} xml
 */
export default async function xmlParse(xml) {
  console.warn("Origami.xmlParse is deprecated. Use Origami.xmlDom instead.");

  xml = args.stringlike(xml, "Origami.xmlParse");
  const dom = await xmlDom(xml);
  return dom;
}
