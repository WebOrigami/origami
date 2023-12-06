import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Returns the scope of the indicated tree or the current scope.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {any} [obj]
 */
export default async function getScope(obj) {
  assertScopeIsDefined(this);
  if (obj) {
    /** @type {any}  */
    const tree = Tree.from(obj);
    return Scope.getScope(tree);
  } else {
    return this;
  }
}

getScope.usage = `@scope/get [<tree>]\tReturns the scope of the tree or the current scope`;
getScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
