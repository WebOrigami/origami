import MapValuesTree from "../../common/MapValuesTree.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new tree with all values equal to null.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 */
export default async function nulls(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  return new MapValuesTree(treelike, () => null, { deep: true });
}

nulls.usage = `nulls <tree>\tReturn a new tree with all values equal to null`;
nulls.documentation = "https://graphorigami.org/cli/builtins.html#nulls";
