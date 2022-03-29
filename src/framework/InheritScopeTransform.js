import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const parentKey = Symbol("parent");

export default function InheritScopeTransform(Base) {
  return class InheritScope extends Base {
    constructor(...args) {
      super(...args);
      this[parentKey] = null;
    }

    async get(key) {
      const value = await super.get(key);
      if (ExplorableGraph.isExplorable(value) && !value.parent) {
        // This graph becomes the parent for all subgraphs.
        value.parent = this;
      }
      return value;
    }

    async formulas() {
      const base = (await super.formulas?.()) ?? [];
      if (this.parent) {
        const parentFormulas = (await this.parent.formulas?.()) ?? [];
        const inherited = parentFormulas.filter(
          (formula) => formula.inheritable
        );
        // Inherited formulas are lower priority, so come last.
        return [...base, ...inherited];
      }
      return base;
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
        return new Scope(this, parent?.scope ?? parent);
      } else {
        // Scope is just the graph itself.
        return this;
      }
    }
  };
}
