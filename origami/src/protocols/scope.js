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
  const value = await ops.scope.call(this, key);
  return keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
}
