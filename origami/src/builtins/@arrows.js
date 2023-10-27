import ArrowTree from "../common/ArrowTree.js";
import { keySymbol, treeWithScope } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Interpret arrow keys in the tree as function calls.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function arrows(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  /** @type {AsyncTree} */
  let tree = new ArrowTree(treelike, { deep: true });
  tree = treeWithScope(tree, this);
  tree[keySymbol] = "@arrows";
  return tree;
}

arrows.usage = `@arrows <obj>\tInterpret arrow keys in the tree as function calls`;
arrows.documentation = "https://graphorigami.org/language/@arrows.html";
