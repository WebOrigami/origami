import svg from "../builtins/svg.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a default SVG file representing the current graph.
 *
 * @this {Explorable}
 */
export default async function defaultSvg() {
  assertScopeIsDefined(this);
  const result = svg.call(this, this);
  return result;
}
