import { Tree } from "@graphorigami/core";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} n
 */
export default async function take(treelike, n) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);

  /** @type {AsyncTree} */
  let takeTree = {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.slice(0, n);
    },

    async get(key) {
      return tree.get(key);
    },
  };

  takeTree = treeWithScope(takeTree, this);

  return takeTree;
}

take.usage = `take tree, n\tReturn the first n items from tree`;
take.documentation = "https://graphorigami.org/cli/builtins.html#take";
