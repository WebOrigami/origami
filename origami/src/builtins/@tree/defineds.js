import { Tree } from "@graphorigami/core";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return only the defined (not `undefined`) values in the tree.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function defineds(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    throw new TypeError("A tree treelike is required");
  }

  /** @type {AsyncTree} */
  let result = await Tree.mapReduce(treelike, null, (values, keys) => {
    const result = {};
    let someValuesExist = false;
    for (let i = 0; i < keys.length; i++) {
      const value = values[i];
      if (value != null) {
        someValuesExist = true;
        result[keys[i]] = values[i];
      }
    }
    return someValuesExist ? result : null;
  });

  if (this) {
    result = treeWithScope(result, this);
  }
  return result;
}
