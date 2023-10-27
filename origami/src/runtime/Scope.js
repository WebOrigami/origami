import { Tree } from "@graphorigami/core";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class Scope {
  constructor(...treelikes) {
    const filtered = treelikes.filter((treelike) => treelike != undefined);
    const trees = filtered.map((treelike) => Tree.from(treelike));

    // If a tree argument has a `trees` property, use that instead.
    const scopes = trees.flatMap(
      (tree) => /** @type {any} */ (tree).trees ?? tree
    );

    this.trees = scopes;
  }

  async get(key) {
    for (const tree of this.trees) {
      const value = await tree.get(key);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
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
      return new Scope(tree, this.getScope(tree.parent));
    } else {
      return tree;
    }
  }

  async keys() {
    const keys = new Set();
    for (const tree of this.trees) {
      for (const key of await tree.keys()) {
        keys.add(key);
      }
    }
    return keys;
  }

  async unwatch() {
    for (const tree of this.trees) {
      await /** @type {any} */ (tree).unwatch?.();
    }
  }
  async watch() {
    for (const tree of this.trees) {
      await /** @type {any} */ (tree).watch?.();
    }
  }
}
