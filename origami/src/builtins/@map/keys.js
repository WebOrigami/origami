import { Scope } from "@graphorigami/language";
import MapInnerKeysTree from "../../common/MapInnerKeysTree.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Wrap a tree and redefine the key used to access nodes in it.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("@graphorigami/async-tree").PlainObject} PlainObject
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {function} keyFn
 * @param {PlainObject} [options]
 */
export default async function mapKeys(treelike, keyFn, options = {}) {
  assertScopeIsDefined(this);
  if (!treelike) {
    return undefined;
  }
  /** @type {AsyncTree} */
  let mappedTree = new MapInnerKeysTree(treelike, keyFn, options);
  mappedTree = Scope.treeWithScope(mappedTree, this);
  return mappedTree;
}

mapKeys.usage = `mapKeys <tree>\tDefine the key used to get nodes from the tree`;
mapKeys.documentation = "https://graphorigami.org/cli/builtins.html#mapKeys";
