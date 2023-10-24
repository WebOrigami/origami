import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
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
  const takeTree = {
    async keys() {
      const keys = Array.from(await tree.keys());
      return keys.slice(0, n);
    },

    async get(key) {
      return tree.get(key);
    },
  };

  return takeTree;
}

take.usage = `take tree, n\tReturn the first n items from tree`;
take.documentation = "https://graphorigami.org/cli/builtins.html#take";
