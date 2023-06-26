import { GraphHelpers } from "@graphorigami/core";
import graphviz from "graphviz-wasm";
import StringWithGraph from "../common/StringWithGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import dot from "./@graph/dot.js";

let graphvizLoaded = false;

/**
 * Render a graph visually in SVG format.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 * @param {PlainObject} [options]
 */
export default async function svg(variant, options = {}) {
  assertScopeIsDefined(this);
  if (!graphvizLoaded) {
    await graphviz.loadWASM();
    graphvizLoaded = true;
  }
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = GraphHelpers.from(variant);
  const dotText = await dot.call(this, graph, options);
  const svgText =
    dotText === undefined ? undefined : await graphviz.layout(dotText, "svg");
  const result = svgText ? new StringWithGraph(svgText, graph) : undefined;
  return result;
}

svg.usage = `@svg <graph>\tRender a graph visually as in SVG format`;
svg.documentation = "https://graphorigami.org/language/@svg.html";
