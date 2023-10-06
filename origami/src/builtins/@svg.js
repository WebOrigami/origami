import { Graph } from "@graphorigami/core";
import graphviz from "graphviz-wasm";
import TextDocument from "../common/TextDocument.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import dot from "./@graph/dot.js";

let graphvizLoaded = false;

/**
 * Render a graph visually in SVG format.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 * @param {PlainObject} [options]
 */
export default async function svg(graphable, options = {}) {
  assertScopeIsDefined(this);
  if (!graphvizLoaded) {
    await graphviz.loadWASM();
    graphvizLoaded = true;
  }
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const dotText = await dot.call(this, graph, options);
  const svgText =
    dotText === undefined ? undefined : await graphviz.layout(dotText, "svg");
  const result = svgText ? new TextDocument(svgText, graph) : undefined;
  return result;
}

svg.usage = `@svg <graph>\tRender a graph visually as in SVG format`;
svg.documentation = "https://graphorigami.org/language/@svg.html";
