import graphviz from "graphviz-wasm";
import ExplorableGraph from "../core/ExplorableGraph.js";
import dot from "./dot.js";

const graphvizPromise = graphviz.loadWASM();

/**
 * Render a graph visually in SVG format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function svg(variant) {
  await graphvizPromise;
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const dotText = await dot(graph);
  const result =
    dotText === undefined ? undefined : await graphviz.layout(dotText, "svg");
  return result;
}

svg.usage = `svg <graph>\tRender a graph visually as in SVG format`;
svg.documentation = "https://explorablegraph.org/cli/builtins.html#svg";
