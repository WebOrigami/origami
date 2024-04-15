import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import scopeSet from "./set.js";

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
export default function scopeExtend(treelike, ...scopeTrees) {
  assertScopeIsDefined(this, "scopeExtend");
  const scope = this;
  return scopeSet.call(scope, treelike, ...scopeTrees, scope);
}

scopeExtend.usage = `@scope/extend <tree>, <...trees>\tExtends tree's scope with the given trees`;
scopeExtend.documentation = "https://weborigami.org/cli/builtins.html#@scope";
