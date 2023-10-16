import { Dictionary, Tree } from "@graphorigami/core";
import Scope from "../common/Scope.js";
import { getScope, isPlainObject, keySymbol } from "../common/utilities.js";

const parentKey = Symbol("parent");
const scopeKey = Symbol("scope");

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this[parentKey] = null;
      this[scopeKey] = null;
    }

    async get(key) {
      const value = await super.get(key);
      if (value && typeof value === "object" && value.parent == null) {
        if (Dictionary.isAsyncDictionary(value)) {
          // This tree becomes the parent for all subtrees.
          /** @type {any} */ (value).parent = this;
        } else if (
          typeof value.unpack === "function" &&
          !(value instanceof Buffer) // HACK: Buffer has weird `parent` property
        ) {
          // This tree becomes the parent for an attached tree.
          const parent = this;
          value.parent = parent;
          const original = value.unpack.bind(value);
          value.unpack = async function () {
            const content = await original();
            if (
              Dictionary.isAsyncDictionary(content) &&
              /** @type {any} */ (content).parent == null
            ) {
              /** @type {any} */
              const tree = Tree.from(content);
              tree.parent = parent;
              return tree;
            } else {
              return content;
            }
          };
        }
        // Add diagnostic information to any (non-plain) object result.
        if (
          value &&
          typeof value === "object" &&
          !isPlainObject(value) &&
          Object.isExtensible(value) &&
          !value[keySymbol]
        ) {
          value[keySymbol] = key;
        }
      }
      return value;
    }

    get parent() {
      return this[parentKey];
    }
    set parent(parent) {
      this[parentKey] = parent;
      this[scopeKey] = null;
    }

    get scope() {
      if (this[scopeKey] === null) {
        const parent = this.parent;
        if (parent) {
          // Add parent to this tree's scope.
          this[scopeKey] = new Scope(this, getScope(parent));
        } else {
          // Scope is just the tree itself.
          this[scopeKey] = this;
        }
      }
      return this[scopeKey];
    }
  };
}
