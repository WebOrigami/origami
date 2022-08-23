import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { getScope } from "./scopeUtilities.js";

const parentKey = Symbol("parent");

export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this[parentKey] = null;
    }

    async get(key) {
      const value = await super.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        // This graph becomes the parent for all subgraphs.
        value.parent = this;
      }
      return value;
    }

    async getFormulas() {
      const formulas = (await super.getFormulas?.()) ?? [];
      if (this.parent) {
        const parentFormulas = (await this.parent.getFormulas?.()) ?? [];
        const inherited = parentFormulas.filter(
          (formula) => formula.inheritable
        );
        // Inherited formulas are lower priority, so come last.
        formulas.push(...inherited);
      }
      return formulas;
    }

    get parent() {
      return this[parentKey];
    }
    set parent(parent) {
      this[parentKey] = parent;
    }

    get scope() {
      const parent = this.parent;
      if (parent) {
        // Add parent to this graph's scope.
        return new Scope(this, getScope(parent));
      } else {
        // Scope is just the graph itself.
        return this;
      }
    }
  };
}
