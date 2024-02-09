import { Tree } from "@weborigami/async-tree";

const keyTypes = ["bigint", "boolean", "number", "string", "symbol"];

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class Scope2 {
  /**
   * @param {import("@weborigami/async-tree").Treelike} treelike
   * @param {Scope2} [baseScope]
   */
  constructor(treelike, baseScope) {
    this.tree = Tree.from(treelike);
    this.cache = {};
    this.baseScope = baseScope;
    if (baseScope) {
      // This scope's cache extends the prototype chain of the base scope's
      // cache. This allows the base scope's cache to be shared among any scopes
      // that extend it.

      // @ts-ignore
      Object.setPrototypeOf(this.cache, baseScope.cache);
    }
  }

  async get(key) {
    if (!keyTypes.includes(typeof key)) {
      console.warn(`Tried to look up a non-primitive value in scope: ${key}`);
    }

    // Search cache first. Because this cache extends the prototype chain of its
    // base scope's cache, this searches the entire base scope chain.
    if (key in this.cache) {
      return this.cache[key];
    }

    // Search local tree
    let value = await this.tree.get(key);

    if (value !== undefined || !this.baseScope) {
      // Cache the result to avoid looking it up again later.
      this.cache[key] = value;
    } else if (value === undefined) {
      // Search base scope
      value = await this.baseScope.get(key);
    }

    return value;
  }

  async keys() {
    // Start with local keys, using a Set to de-duplicate.
    const keys = new Set(await this.tree.keys());

    // Add base keys
    const baseKeys = (await this.baseScope?.keys()) ?? [];
    for (const key of baseKeys) {
      keys.add(key);
    }

    return keys;
  }

  // This method exists for debugging purposes, as it's helpful to be able to
  // quickly flatten and view the entire scope chain.
  get trees() {
    return [this.tree, ...(this.baseScope?.trees ?? [])];
  }
}
