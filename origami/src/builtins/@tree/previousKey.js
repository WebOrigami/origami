import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key before the indicated key.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {any} key
 * @this {AsyncTree|null}
 */
export default async function previousKey(treelike, key) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);
  let previousKey = undefined;
  for (const treeKey of await tree.keys()) {
    if (treeKey === key) {
      return previousKey;
    }
    previousKey = treeKey;
  }
  return undefined;
}

previousKey.usage = `previousKey <tree>, <key>\tReturns the key before the indicated key`;
previousKey.documentation =
  "https://graphorigami.org/cli/builtins.html#previousKey";
