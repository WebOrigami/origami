import { keySymbol } from "../common/utilities.js";
import ArrowTree from "../framework/ArrowTree.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Interpret arrow keys in the tree as function calls.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function arrows(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = new ArrowTree(treelike, { deep: true });
  tree[keySymbol] = "@arrows";
  return tree;
}

arrows.usage = `@arrows <obj>\tInterpret arrow keys in the tree as function calls`;
arrows.documentation = "https://graphorigami.org/language/@arrows.html";
