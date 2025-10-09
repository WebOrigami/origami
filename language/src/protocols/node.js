import { trailingSlash, Tree } from "@weborigami/async-tree";

/**
 * The node: protocol does a dynamic import from the `node:` namespace.
 *
 * @param {string[]} keys
 */
export default async function node(...keys) {
  const key = keys.shift();
  const normalized = trailingSlash.remove(key);
  const module = await import(`node:${normalized}`);
  return keys.length > 0 ? Tree.traverse(module, ...keys) : module;
}
