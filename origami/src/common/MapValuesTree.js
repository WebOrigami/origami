import { Dictionary, Tree } from "@graphorigami/core";
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
  }

  /**
   * Retrieves the value for the given key from the original `tree`.
   *
   * @param {any} key
   */
  async get(key) {
    let value;
    let isSubtree;
    let invokeMapFn;
    if (this.getValue || this.tree.isKeyForSubtree === undefined) {
      value = await this.tree.get(key);
      isSubtree = Dictionary.isAsyncDictionary(value);
      invokeMapFn = value !== undefined;
    } else {
      isSubtree = await this.tree.isKeyForSubtree(key);
      invokeMapFn = true;
      value = isSubtree
        ? // Will need to get value to create subtree.
          await this.tree.get(key)
        : // Don't need value
          undefined;
    }

    if (!invokeMapFn) {
      return undefined;
    }

    const mapFn = addValueKeyToScope(
      getScope(this),
      this.mapFn,
      value,
      key,
      this.options.valueName,
      this.options.keyName
    );

    return this.deep && isSubtree
      ? // Return mapped subtree
        Reflect.construct(this.constructor, [value, mapFn, this.options])
      : await mapFn(value); // Return mapped value
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
