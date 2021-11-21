import { graphviz } from "node-graphviz";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import dot from "./dot.js";

// @ts-ignore
export default async function svg(variant = this.graph) {
  const graph = ExplorableGraph.from(variant);
  const dotText = await dot(graph);
  const result = await graphviz.dot(dotText, "svg");
  return result;
}
svg.usage = `svg(graph)\tRender a graph visually as in SVG format`;
