import * as Tree from "./Tree.js";

/**
 * A tree that is loaded lazily.
 *
 * This is useful in situations that must return a tree synchronously. If
 * constructing the tree requires an asynchronous operation, this class can be
 * used as a wrapper that can be returned immediately. The tree will be loaded
 * the first time the keys() or get() functions are called.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
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

  // HACK: The concept of scope is defined in Origami, not at the AsyncTree
  // level. If a DeferredTree is used to wrap an OrigamiTree, the inner
  // OrigamiTree will have a `scope` but not a `parent`. If someone asks the
  // outer deferrred tree for a scope, they'd otherwise get `undefined`, which
  // is incorrect. As a workaround, we introduce a `scope` getter here that
  // defers to the inner tree, but we need to find a way to avoid having to
  // introduce the concept of scope here.
  get scope() {
    return /** @type {any} */ (this._tree)?.scope;
  }
  set scope(scope) {
    // If tree hasn't been loaded yet, setting scope has no effect.
    if (this._tree) {
      /** @type {any} */ (this._tree).scope = scope;
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
