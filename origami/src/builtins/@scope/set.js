import { Tree } from "@graphorigami/core";
import { keySymbol, treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import Scope from "../../runtime/Scope.js";

/**
 * Return a copy of the given tree that has the indicated trees as its scope.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} treelike
 * @param  {...(Treelike|null)} scopeTrees
 * @this {AsyncTree|null}
 */
export default function setScope(treelike, ...scopeTrees) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);
  const scope = scopeTrees.length === 0 ? this : new Scope(...scopeTrees);
  const result = treeWithScope(tree, scope);
  result[keySymbol] = tree[keySymbol];
  return result;
}

setScope.usage = `@scope/set <tree>, <...trees>\tReturns a tree copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
