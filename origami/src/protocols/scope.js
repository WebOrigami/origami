import { Tree } from "@weborigami/async-tree";
import { ops } from "@weborigami/language";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function scope(...keys) {
  const key = keys.shift();
  let value;
  try {
    // Look up key in scope but don't throw if it's undefined
    value = await ops.scope.call(this, key);
  } catch (error) {
    if (error instanceof ReferenceError) {
      value = undefined;
    } else {
      throw error;
    }
  }
  return keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
}
