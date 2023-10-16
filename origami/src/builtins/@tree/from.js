import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Cast the indicated treelike to a tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function tree(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  return Tree.from(treelike);
}

tree.usage = `tree <treelike>\tConvert JSON, YAML, function, or plain object to a tree`;
tree.documentation = "https://graphorigami.org/cli/builtins.html#tree";
