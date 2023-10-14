import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import setScope from "./set.js";

/**
 * Return a copy of the given graph whose scope includes the given graphs *and*
 * the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 * @param  {...Graphable} scopeGraphs
 * @this {AsyncDictionary|null}
 */
export default function extendScope(graphable, ...scopeGraphs) {
  assertScopeIsDefined(this);
  const scope = this;
  return setScope.call(scope, graphable, ...scopeGraphs, scope);
}

extendScope.usage = `@scope/extend <graph>, <...graphs>\tExtends graph's scope with the given graphs`;
extendScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
