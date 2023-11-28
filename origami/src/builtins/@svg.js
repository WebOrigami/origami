import { Tree } from "@graphorigami/async-tree";
import graphviz from "graphviz-wasm";
import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import dot from "./@tree/dot.js";

let graphvizLoaded = false;

/**
 * Render a tree visually in SVG format.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("@graphorigami/async-tree").PlainObject} PlainObject
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
  const svgText =
    dotText === undefined ? undefined : await graphviz.layout(dotText, "svg");
  const result = svgText ? new TextDocument(svgText, tree) : undefined;
  return result;
}

svg.usage = `@svg <tree>\tRender a tree visually as in SVG format`;
svg.documentation = "https://graphorigami.org/language/@svg.html";
