import { Dictionary, Graph } from "@graphorigami/core";
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
      if (value) {
        if (Dictionary.isAsyncDictionary(value) && value.parent == null) {
          // This graph becomes the parent for all subgraphs.
          value.parent = this;
        } else if (
          typeof value.contents === "function" &&
          value.parent == null
        ) {
          // This graph becomes the parent for an attached graph.
          const parent = this;
          value.parent = parent;
          const original = value.contents.bind(value);
          value.contents = async function () {
            const contents = await original();
            if (Graph.isGraphable(contents)) {
              /** @type {any} */
              const graph = Graph.from(contents);
              graph.parent = parent;
              return graph;
            } else {
              return contents;
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
          // Add parent to this graph's scope.
          this[scopeKey] = new Scope(this, getScope(parent));
        } else {
          // Scope is just the graph itself.
          this[scopeKey] = this;
        }
      }
      return this[scopeKey];
    }
  };
}
