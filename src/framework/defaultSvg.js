import svg from "../builtins/svg.js";

/**
 * Return a default SVG file representing the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultSvg() {
  const result = svg(this);
  return result;
}
