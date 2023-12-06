import { Tree } from "@weborigami/async-tree";
import graphviz from "graphviz-wasm";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import dot from "./@tree/dot.js";

let graphvizLoaded = false;

/**
 * Render a tree visually in SVG format.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {PlainObject} [options]
 */
export default async function svg(treelike, options = {}) {
  assertScopeIsDefined(this);
  if (!graphvizLoaded) {
    await graphviz.loadWASM();
    graphvizLoaded = true;
  }
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  const dotText = await dot.call(this, tree, options);
  if (dotText === undefined) {
    return undefined;
  }
  const svgText = await graphviz.layout(dotText, "svg");
  /** @type {any} */
  const result = new String(svgText);
  result.unpack = () => tree;
  return result;
}

svg.usage = `@svg <tree>\tRender a tree visually as in SVG format`;
svg.documentation = "https://weborigami.org/language/@svg.html";
