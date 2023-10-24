import MapInnerKeysTree from "../../common/MapInnerKeysTree.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Wrap a tree and redefine the key used to access nodes in it.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} treelike
 * @param {function} keyFn
 * @param {PlainObject} [options]
 */
export default async function mapKeys(treelike, keyFn, options = {}) {
  assertScopeIsDefined(this);
  if (!treelike) {
    return undefined;
  }
  const mappedTree = new MapInnerKeysTree(treelike, keyFn, options);
  return mappedTree;
}

mapKeys.usage = `mapKeys <tree>\tDefine the key used to get nodes from the tree`;
mapKeys.documentation = "https://graphorigami.org/cli/builtins.html#mapKeys";
