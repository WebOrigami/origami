import { getScope } from "../common/utilities.js";
import Scope from "./Scope.js";

const scopeKey = Symbol("scope");

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function InheritScopeMixin(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this[scopeKey] = null;
    }

    /** @type {import("@graphorigami/types").AsyncTree} */
    get scope() {
      if (this[scopeKey] === null) {
        if (this.parent) {
          // Add parent to this tree's scope.
          this[scopeKey] = new Scope(this, getScope(this.parent));
        } else {
          // Scope is just the tree itself.
          this[scopeKey] = this;
        }
      }
      return this[scopeKey];
    }
    set scope(scope) {
      this[scopeKey] = scope;
    }
  };
}
