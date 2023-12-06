import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import setScope from "./set.js";

/**
 * Return a copy of the given tree whose scope includes the given trees *and*
 * the current scope.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param  {...Treelike} scopeTrees
 * @this {AsyncTree|null}
 */
export default function extendScope(treelike, ...scopeTrees) {
  assertScopeIsDefined(this);
  const scope = this;
  return setScope.call(scope, treelike, ...scopeTrees, scope);
}

extendScope.usage = `@scope/extend <tree>, <...trees>\tExtends tree's scope with the given trees`;
extendScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
