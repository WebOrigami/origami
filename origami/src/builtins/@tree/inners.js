import { Dictionary, Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the inner nodes of the tree: the nodes with children.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function inners(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);
  const inner = {
    async get(key) {
      const value = await tree.get(key);
      return Dictionary.isAsyncDictionary(value)
        ? inners.call(this, value)
        : undefined;
    },

    async keys() {
      const subtreeKeys = [];
      for (const key of await tree.keys()) {
        if (await Tree.isKeyForSubtree(tree, key)) {
          subtreeKeys.push(key);
        }
      }
      return subtreeKeys;
    },
  };
  return inner;
}

inners.usage = `inners <tree>\tThe inner nodes of the tree`;
inners.documentation = "https://graphorigami.org/cli/builtins.html#inners";
