import { Tree } from "@graphorigami/core";
import Scope from "../../common/Scope.js";
import { keySymbol, treeInContext } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a copy of the given tree that has the indicated trees as its scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} treelike
 * @param  {...(Treelike|null)} scopeTrees
 * @this {AsyncDictionary|null}
 */
export default function setScope(treelike, ...scopeTrees) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);
  const scope = scopeTrees.length === 0 ? this : new Scope(...scopeTrees);
  const result = treeInContext(tree, scope);
  result[keySymbol] = tree[keySymbol];
  return result;
}

setScope.usage = `@scope/set <tree>, <...trees>\tReturns a tree copy with the given scope`;
setScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
