import { Dictionary, Tree } from "@graphorigami/core";
import addValueKeyToScope from "./addValueKeyToScope.js";
import { getScope, toFunction } from "./utilities.js";

export default class MapInnerKeysTree {
  constructor(treelike, keyFn, options = {}) {
    this.tree = Tree.from(treelike);
    this.keyFn = toFunction(keyFn);
    this.deep = options.deep ?? false;
    this.mapInnerKeyToOuterKey = new Map();
    this.mapOuterKeyToInnerKey = new Map();
    this.options = options;
    this.parent = null;
  }

  async get(outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);
    let value =
      innerKey === undefined ? undefined : await this.tree.get(innerKey);

    // If the value to return is a tree, wrap it with a map.
    if (this.deep && Dictionary.isAsyncDictionary(value)) {
      value = Reflect.construct(this.constructor, [
        value,
        this.keyFn,
        this.options,
      ]);
    }

    if (Tree.isAsyncTree(value)) {
      value.parent = this;
    }

    return value;
  }

  // This is expensive, as we have to loop through all the keys in the inner
  // tree, get values, and map the value and inner key to an outer key. We
  // cache the result, so this is only done once per outer key.
  async innerKeyForOuterKey(outerKey) {
    if (!this.mapOuterKeyToInnerKey.has(outerKey)) {
      // We will also memoize a mapping of an outer key to undefined.
      let innerKey = undefined;
      for (const key of await this.tree.keys()) {
        const mappedKey = await this.outerKeyForInnerKey(key);
        if (mappedKey === outerKey) {
          innerKey = key;
          break;
        }
      }
      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
    }
    return this.mapOuterKeyToInnerKey.get(outerKey);
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

  onChange(key) {
    this.mapInnerKeyToOuterKey.clear();
    this.mapOuterKeyToInnerKey.clear();
  }

  async outerKeyForInnerKey(innerKey) {
    if (!this.mapInnerKeyToOuterKey.has(innerKey)) {
      const value = await this.tree.get(innerKey);

      if (value === undefined || !this.keyFn) {
        return undefined;
      }

      const scope = addValueKeyToScope(
        // @ts-ignore
        this.scope ?? getScope(this.parent),
        value,
        innerKey
      );

      const outerKey = await this.keyFn.call(scope, value, innerKey);

      this.mapOuterKeyToInnerKey.set(outerKey, innerKey);
      this.mapInnerKeyToOuterKey.set(innerKey, outerKey);
    }
    return this.mapInnerKeyToOuterKey.get(innerKey);
  }

  async unwatch() {
    return /** @type {any} */ (this.tree).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.tree).watch?.();
  }
}
