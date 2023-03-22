import dataflow from "../builtins/@graph/dataflow.js";
import flowSvg from "../builtins/@graph/flowSvg.js";

/**
 * Return an SVG representing the data flow for the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultDataflow() {
  const flow = await dataflow(this);
  const svg = await flowSvg(flow);
  return svg;
}
