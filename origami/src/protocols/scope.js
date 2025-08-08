import { Tree, scope as scopeFn } from "@weborigami/async-tree";
import { attachWarning } from "@weborigami/language";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function scope(...keys) {
  assertTreeIsDefined(this, "scope");
  const key = keys.shift();
  let value;
  try {
    // Look up key in scope but don't throw if it's undefined
    const thisScope = scopeFn(this);
    value = await thisScope.get(key);
  } catch (error) {
    if (error instanceof ReferenceError) {
      value = undefined;
    } else {
      throw error;
    }
  }
  const result = keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
  return attachWarning(
    result,
    "The scope protocol is deprecated. In most cases it can be dropped."
  );
}
