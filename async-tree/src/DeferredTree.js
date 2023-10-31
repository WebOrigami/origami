import * as Tree from "./Tree.js";

/**
 * A tree that is loaded lazily.
 *
 * This is useful in situations that must return a tree synchronously. If
 * constructing the tree requires an asynchronous operation, this class can be
 * used as a wrapper that can be returned immediately. The tree will be loaded
 * the first time the keys() or get() functions are called.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class DeferredTree {
  /**
   * @param {Function|Promise<any>} loader
   */
  constructor(loader) {
    this.loader = loader;
    this.treePromise = null;
    this._tree = null;
    this._parent = null;
  }

  async get(key) {
    const tree = await this.tree();
    return tree.get(key);
  }

  async loadResult() {
    if (!(this.loader instanceof Promise)) {
      this.loader = this.loader();
    }
    return this.loader;
  }

  async keys() {
    const tree = await this.tree();
    return tree.keys();
  }

  get parent() {
    return this._tree?.parent ?? this._parent;
  }
  set parent(parent) {
    if (this._tree && !this._tree.parent) {
      this._tree.parent = parent;
    } else {
      this._parent = parent;
    }
  }

  async tree() {
    if (this._tree) {
      return this._tree;
    }

    // Use a promise to ensure the treelike is only converted to a tree once.
    this.treePromise ??= this.loadResult().then((treelike) => {
      this._tree = Tree.from(treelike);
      if (this._parent) {
        if (!this._tree.parent) {
          this._tree.parent = this._parent;
        }
        this._parent = null;
      }
      return this._tree;
    });

    return this.treePromise;
  }
}
