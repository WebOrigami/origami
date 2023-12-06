import { Tree } from "@weborigami/async-tree";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
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
