import { Tree } from "@graphorigami/core";
import * as utilities from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the scope of the indicated tree or the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {any} [obj]
 */
export default async function getScope(obj) {
  assertScopeIsDefined(this);
  if (obj) {
    /** @type {any}  */
    const tree = Tree.from(obj);
    return utilities.getScope(tree);
  } else {
    return this;
  }
}

getScope.usage = `@scope/get [<tree>]\tReturns the scope of the tree or the current scope`;
getScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
