import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import Scope from "../../runtime/Scope.js";

/**
 * Cast the indicated treelike to a tree.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function tree(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }

  /** @type {AsyncTree} */
  let result = Tree.from(treelike);
  result = Scope.treeWithScope(result, this);
  return result;
}

tree.usage = `tree <treelike>\tConvert JSON, YAML, function, or plain object to a tree`;
tree.documentation = "https://graphorigami.org/cli/builtins.html#tree";
