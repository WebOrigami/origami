import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { args } from "@weborigami/async-tree";

import dot from "./treeDot.js";

let graphviz;

/**
 * Render a tree visually in SVG format.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {Maplike} maplike
 * @param {PlainObject} [options]
 */
export default async function svg(maplike, options = {}) {
  if (!graphviz) {
    graphviz = await Graphviz.load();
  }
  const tree = await args.map(maplike, "Dev.svg", { deep: true });
  const dotText = await dot(tree, options);
  if (dotText === undefined) {
    return undefined;
  }
  const svgText = await graphviz.dot(dotText);
  /** @type {any} */
  const result = new String(svgText);
  result.mediaType = "image/svg+xml";
  result.unpack = () => tree;
  return result;
}
