import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import setScope from "./set.js";

/**
 * Return a copy of the given tree whose scope includes the given trees *and*
 * the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} treelike
 * @param  {...Treelike} scopeTrees
 * @this {AsyncDictionary|null}
 */
export default function extendScope(treelike, ...scopeTrees) {
  assertScopeIsDefined(this);
  const scope = this;
  return setScope.call(scope, treelike, ...scopeTrees, scope);
}

extendScope.usage = `@scope/extend <tree>, <...trees>\tExtends tree's scope with the given trees`;
extendScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
