import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
import Scope from "../../runtime/Scope.js";

/**
 * Return the inner nodes of the tree: the nodes with children.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function inners(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);

  /** @type {AsyncTree} */
  let result = {
    async get(key) {
      const value = await tree.get(key);
      return Tree.isAsyncTree(value) ? inners.call(this, value) : undefined;
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

  result = Scope.treeWithScope(result, this);
  return result;
}

inners.usage = `inners <tree>\tThe inner nodes of the tree`;
inners.documentation = "https://graphorigami.org/cli/builtins.html#inners";
