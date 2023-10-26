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
