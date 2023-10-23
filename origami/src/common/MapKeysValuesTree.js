import { Dictionary, Tree } from "@graphorigami/core";
import addValueKeyToScope from "./addValueKeyToScope.js";
import * as utilities from "./utilities.js";
import { getScope } from "./utilities.js";

/**
 * Given a tree and a function, return a new tree that applies the function to
 * the original tree's values. Optionally transform the original tree's keys.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class MapKeysValuesTree {
  /**
   * @typedef {import("@graphorigami/core").Treelike} Treelike
   * @typedef {import("@graphorigami/core").PlainObject} PlainObject
   * @typedef {import("../../index.js").Invocable} Invocable
   *
   * @param {Treelike} treelike
   * @param {Invocable | null} mapFn
   * @param {PlainObject} options
   */
  constructor(treelike, mapFn, options = {}) {
    this.tree = Tree.from(treelike);
    this.mapFn = mapFn ? utilities.toFunction(mapFn) : null;
    this.deep = options.deep ?? false;
    this.getValue = options.getValue ?? true;
    this.preferExistingValue = options.preferExistingValue ?? false;
    this.options = options;
    this.parent = null;
  }

  // Apply the mapping function to the original tree's values.
  async get(outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);

    let outerValue;
    if (this.preferExistingValue && innerKey !== outerKey) {
      // First check to see if the outer key already exists in the source tree.
      // If it does, we assume it's already been explicitly mapped, so we'll use
      // that value instead of mapping it ourselves.
      outerValue = await this.tree.get(outerKey);

      // If the value to return is a subtree, wrap it with a map.
      if (this.deep && Dictionary.isAsyncDictionary(outerValue)) {
        outerValue = Reflect.construct(this.constructor, [
          outerValue,
          this.mapFn,
          this.options,
        ]);
      }

      if (outerValue !== undefined) {
        return outerValue;
      }
    }

    if (innerKey === undefined) {
      return undefined;
    }

    // Ask inner tree for value.
    const innerValue = this.getValue
      ? await this.tree.get(innerKey)
      : undefined;

    const mapFn = this.mapFn;
    let scope = this.scope ?? getScope(this.parent);

    // Determine whether we want to apply the map to this value.
    const applyMap =
      mapFn && (await this.mapApplies(innerValue, outerKey, innerKey));
    if (applyMap) {
      scope = addValueKeyToScope(
        scope,
        innerValue,
        innerKey,
        this.options.valueName,
        this.options.keyName
      );
      outerValue = await mapFn.call(scope, innerValue, outerKey, innerKey);
    } else {
      outerValue = innerValue;
    }

    // If the value to return is a subtree, wrap it with a map.
    if (Tree.isAsyncTree(outerValue)) {
      if (this.deep) {
        outerValue = Reflect.construct(this.constructor, [
          outerValue,
          mapFn,
          this.options,
        ]);
      }
      outerValue.parent = this;
      outerValue.scope = scope;
    }

    return outerValue;
  }

  async innerKeyForOuterKey(outerKey) {
    return outerKey;
  }

  async keys() {
    const keys = new Set();
    for (const innerKey of await this.tree.keys()) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        keys.add(outerKey);
      }
    }
    return keys;
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    // By default, we only apply the map to real values, or if we're not getting
    // a value.
    return innerValue !== undefined || !this.getValue;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey;
  }

  async unwatch() {
    return /** @type {any} */ (this.tree).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.tree).watch?.();
  }
}
