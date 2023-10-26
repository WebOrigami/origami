import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function count(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = await Tree.from(treelike);
  const keys = [...(await tree.keys())];
  return keys.length;
}

count.usage = `count <treelike>\tReturn the number of keys in the tree`;
count.documentation = "https://graphorigami.org/cli/@tree.html#count";
