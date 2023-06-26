/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import dataflow from "../builtins/@graph/dataflow.js";
import flowSvg from "../builtins/@graph/flowSvg.js";

/**
 * Return an SVG representing the data flow for the current graph.
 *
 * @this {AsyncDictionary|null}
 */
export default async function defaultDataflow() {
  if (!this) {
    return undefined;
  }
  const flow = await dataflow.call(this, this);
  const svg = await flowSvg(flow);
  return svg;
}
