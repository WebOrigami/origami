import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { keySymbol } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a copy of the given tree that has the indicated trees as its scope.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @param {Treelike} treelike
 * @param  {...(Treelike|null)} scopeTrees
 * @this {AsyncTree|null}
 */
export default function scopeSet(treelike, ...scopeTrees) {
  assertScopeIsDefined(this, "scopeSet");
  const tree = Tree.from(treelike);
  const scope = scopeTrees.length === 0 ? this : new Scope(...scopeTrees);
  const result = Scope.treeWithScope(tree, scope);
  result[keySymbol] = tree[keySymbol];
  return result;
}

scopeSet.usage = `@scope/set <tree>, <...trees>\tReturns a tree copy with the given scope`;
scopeSet.documentation = "https://weborigami.org/cli/builtins.html#@scope";
