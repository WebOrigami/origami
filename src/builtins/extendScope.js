import setScope from "./setScope.js";

/**
 * Return a copy of the given graph whose scope includes the given graphs *and*
 * the current scope.
 *
 * @param {GraphVariant} variant
 * @param  {...GraphVariant} scopeGraphs
 * @this {Explorable}
 */
export default function extendScope(variant, ...scopeGraphs) {
  const scope = this;
  return setScope.call(scope, variant, ...scopeGraphs, scope);
}

extendScope.usage = `extendScope <graph>, <...graphs>\tExtends graph's scope with the given graphs`;
extendScope.documentation =
  "https://graphorigami.org/cli/builtins.html#extendScope";
