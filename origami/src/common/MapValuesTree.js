import { Tree } from "@graphorigami/core";
import addValueKeyToScope from "./addValueKeyToScope.js";
import { getScope, toFunction } from "./utilities.js";

/**
 * Given a tree and a function, return a new tree that applies the function to
 * the original tree's values.
 */
export default class MapValuesTree {
  /**
   * @typedef {import("@graphorigami/core").Treelike} Treelike
   * @typedef {import("@graphorigami/core").PlainObject} PlainObject
   * @typedef {import("../../index.js").Invocable} Invocable
   *
   * @param {Treelike} treelike
   * @param {Invocable} mapFn
   * @param {PlainObject} options
   */
  constructor(treelike, mapFn, options = {}) {
    this.tree = Tree.from(treelike);
    this.mapFn = toFunction(mapFn);
    this.deep = options.deep ?? false;
    this.getValue = options.getValue ?? true;
    this.options = options;
    this.parent = null;
  }

  /**
   * Retrieves the value for the given key from the original `tree`.
   *
   * @param {any} key
   */
  async get(key) {
    let innerValue;
    let isSubtree;
    let invokeMapFn;
    if (this.getValue || this.tree.isKeyForSubtree === undefined) {
      innerValue = await this.tree.get(key);
      isSubtree = Tree.isAsyncTree(innerValue);
      invokeMapFn = innerValue !== undefined;
    } else {
      isSubtree = await this.tree.isKeyForSubtree(key);
      invokeMapFn = true;
      innerValue = isSubtree
        ? // Will need to get value to create subtree.
          await this.tree.get(key)
        : // Don't need value
          undefined;
    }

    if (!invokeMapFn) {
      return undefined;
    }

    const scope = addValueKeyToScope(
      this.scope ?? getScope(this.parent),
      innerValue,
      key,
      this.options.valueName,
      this.options.keyName
    );

    let outerValue;
    if (this.deep && isSubtree) {
      // Get mapped subtree
      outerValue = Reflect.construct(this.constructor, [
        innerValue,
        this.mapFn,
        this.options,
      ]);
    } else {
      // Get mapped value
      outerValue = await this.mapFn.call(scope, innerValue);
    }

    if (Tree.isAsyncTree(outerValue)) {
      outerValue.parent = this;
      outerValue.scope = scope;
    }

    return outerValue;
  }

  /**
   * Returns the same keys as the original `tree`.
   */
  async keys() {
    return this.tree.keys();
  }

  async unwatch() {
    return /** @type {any} */ (this.tree).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.tree).watch?.();
  }
}
