import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import setScope from "./set.js";

/**
 * Return a copy of the given graph whose scope includes the given graphs *and*
 * the current scope.
 *
 * @param {GraphVariant} variant
 * @param  {...GraphVariant} scopeGraphs
 * @this {Explorable|null}
 */
export default function extendScope(variant, ...scopeGraphs) {
  assertScopeIsDefined(this);
  const scope = this;
  return setScope.call(scope, variant, ...scopeGraphs, scope);
}

extendScope.usage = `@scope/extend <graph>, <...graphs>\tExtends graph's scope with the given graphs`;
extendScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
