import { Tree } from "@graphorigami/core";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Returns the scope of the indicated tree or the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
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
