import { Tree } from "@weborigami/async-tree";

const keyTypes = ["bigint", "boolean", "number", "string", "symbol"];

/**
 * A Scope is a tree optimized for implementing an Origami scope chain.
 *
 * The tree only keys which are strings (or primitive values that can map to
 * strings) or Symbols.
 *
 * A scope maintains a cache of values it has looked up. A scope can be based on
 * another scope, which it will search if it can't find a value in its own cache
 * or tree. A scope's cache is shared by all scopes that are based on it.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class ScopeNew {
  /**
   * @typedef {import("@weborigami/async-tree").Treelike} Treelike
   * @param {(Treelike|null)[]} treelikes
   */
  constructor(...treelikes) {
    const filtered = treelikes.filter((treelike) => treelike != undefined);
    if (filtered.length === 0) {
      filtered.push({});
    }
    const trees = filtered.map((treelike) => Tree.from(treelike));
    let [tree, ...more] = trees;
    if (tree.trees?.length > 1) {
      return new ScopeNew(...[...tree.trees, ...more]);
    }
    this.tree = tree;
    this.cache = {};
    if (more.length > 0) {
      this.baseScope =
        more.length === 1 && more[0] instanceof ScopeNew
          ? more[0]
          : new ScopeNew(...more);
      // This scope's cache extends the prototype chain of the base scope's
      // cache. This allows the base scope's cache to be shared among any scopes
      // that extend it.

      // @ts-ignore
      Object.setPrototypeOf(this.cache, this.baseScope.cache);
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

  /**
   * If the given tree has a `scope` property, return that. If the tree has a
   * `parent` property, construct a scope for the tree and its parent.
   * Otherwise, return the tree itself.
   *
   * @param {AsyncTree|null|undefined} tree
   * @returns {AsyncTree|null}
   */
  static getScope(tree) {
    if (!tree) {
      return null;
    } else if ("scope" in tree) {
      return /** @type {any} */ (tree).scope;
    } else if (Tree.isAsyncTree(tree)) {
      return new ScopeNew(tree, this.getScope(tree.parent));
    } else {
      return tree;
    }
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

  /**
   * Return a new tree equivalent to the given tree, but with the given scope.
   *
   * The tree itself will be automatically included at the front of the scope.
   *
   * @param {Treelike} treelike
   * @param {Treelike|null} scope
   * @returns {AsyncTree & { scope: AsyncTree }}
   */
  static treeWithScope(treelike, scope) {
    // If the treelike was already a tree, create a copy of it.
    const tree = Tree.isAsyncTree(treelike)
      ? Object.create(treelike)
      : Tree.from(treelike);
    tree.scope = new ScopeNew(tree, scope);
    return tree;
  }
}
