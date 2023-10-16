/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import dataflow from "../builtins/@tree/dataflow.js";
import flowSvg from "../builtins/@tree/flowSvg.js";

/**
 * Return an SVG representing the data flow for the current tree.
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
