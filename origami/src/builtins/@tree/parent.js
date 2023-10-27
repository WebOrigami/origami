import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function parent(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  return tree.parent;
}

parent.usage = `parent\tThe parent of the current tree`;
parent.documentation = "https://graphorigami.org/cli/builtins.html#parent";
