import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function first(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  for (const key of await tree.keys()) {
    // Just return first value immediately.
    const value = await tree.get(key);
    return value;
  }
  return undefined;
}

first.usage = `first <tree>\tReturns the first value in the tree.`;
first.documentation = "https://graphorigami.org/cli/builtins.html#first";
