import * as Tree from "./Tree.js";

/**
 * A tree that is loaded lazily.
 *
 * This is useful in situations that must return a tree synchronously. If
 * constructing the tree requires an asynchronous operation, this class can be
 * used as a wrapper that can be returned immediately. The tree will be loaded
 * the first time the keys() or get() functions are called.

* @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
* @typedef {import("@graphorigami/types").AsyncTree} AsyncTree

 * @implements {AsyncTree}
 */
export default class DeferredTree {
  /**
   *
   * @param {Function|Promise<any>} loader
   */
  constructor(loader) {
    this.loader = loader;
    this.treePromise = null;
    /** @type {AsyncTree|null} */
    this._tree = null;
    /** @type {AsyncDictionary|null} */
    this._parent = null;
  }

  async get(key) {
    return key === Tree.defaultValueKey
      ? this.loadResult()
      : (await this.tree()).get(key);
  }

  async loadResult() {
    if (!(this.loader instanceof Promise)) {
      this.loader = this.loader();
    }
    return this.loader;
  }

  async keys() {
    return (await this.tree()).keys();
  }

  get parent() {
    return this._tree?.parent ?? this._parent;
  }
  set parent(parent) {
    if (this._tree) {
      this._tree.parent = parent;
      this._tree.parent2 = parent;
    } else {
      this._parent = parent;
    }
  }

  get parent2() {
    return this.parent;
  }
  set parent2(parent) {
    this.parent = parent;
  }

  async tree() {
    if (this._tree) {
      return this._tree;
    }

    // Use a promise to ensure that the treelike is only converted to a tree
    // once.
    if (!this.treePromise) {
      this.treePromise = this.loadResult().then((treelike) => {
        this._tree = Tree.from(treelike);
        if (this._parent) {
          this._tree.parent = this._parent;
          this._tree.parent2 = this._parent;
          this._parent = null;
        }
        return this._tree;
      });
    }

    return this.treePromise;
  }
}
