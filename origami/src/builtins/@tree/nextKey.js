import { Tree } from "@weborigami/async-tree";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Returns the key after the indicated key.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {any} key
 */
export default async function nextKey(treelike, key) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);
  let returnNextKey = false;
  for (const treeKey of await tree.keys()) {
    if (returnNextKey) {
      return treeKey;
    }
    if (treeKey === key) {
      returnNextKey = true;
    }
  }
  return undefined;
}

nextKey.usage = `nextKey <tree>, <key>\tReturns the key after the indicated key`;
nextKey.documentation = "https://weborigami.org/cli/builtins.html#nextKey";
