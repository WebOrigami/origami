import graphviz from "graphviz-wasm";
import getTreeArgument from "../common/getTreeArgument.js";
import dot from "./treeDot.js";

let graphvizLoaded = false;

/**
 * Render a tree visually in SVG format.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @param {Treelike} [treelike]
 * @param {PlainObject} [options]
 */
export default async function svg(treelike, options = {}) {
  if (!graphvizLoaded) {
    await graphviz.loadWASM();
    graphvizLoaded = true;
  }
  const tree = await getTreeArgument(this, arguments, treelike, "svg", true);
  const dotText = await dot(tree, options);
  if (dotText === undefined) {
    return undefined;
  }
  const svgText = await graphviz.layout(dotText, "svg");
  /** @type {any} */
  const result = new String(svgText);
  result.mediaType = "image/svg+xml";
  result.unpack = () => tree;
  return result;
}
