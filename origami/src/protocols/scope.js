import { Tree, scope as scopeFn } from "@weborigami/async-tree";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function scope(...keys) {
  console.warn(
    `Warning: the scope: protocol is deprecated. In most cases it can be dropped.`
  );
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
  return keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
}
