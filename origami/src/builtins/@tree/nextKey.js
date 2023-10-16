import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key after the indicated key.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
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
nextKey.documentation = "https://graphorigami.org/cli/builtins.html#nextKey";
