import { args } from "@weborigami/async-tree";
import htmlDom from "./htmlDom.js";

/**
 * Return the DOM structure for the given HTML.
 *
 * @param {import("@weborigami/async-tree").Stringlike} html
 */
export default async function htmlParse(html) {
  console.warn("Origami.htmlParse is deprecated. Use Origami.htmlDom instead.");

  html = args.stringlike(html, "Origami.htmlParse");
  const dom = await htmlDom(html);
  return dom;
}
