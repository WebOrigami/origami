import MapValuesTree from "../../common/MapValuesTree.js";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new tree with all values equal to null.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function nulls(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  /** @type {AsyncTree} */
  let mappedTree = new MapValuesTree(treelike, () => null, { deep: true });
  if (this) {
    mappedTree = treeWithScope(mappedTree, this);
  }
  return mappedTree;
}

nulls.usage = `nulls <tree>\tReturn a new tree with all values equal to null`;
nulls.documentation = "https://graphorigami.org/cli/builtins.html#nulls";
